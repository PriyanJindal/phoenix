from typing import Optional

import strawberry
from sqlalchemy import delete, insert, select
from sqlalchemy.dialects import postgresql, sqlite
from starlette.requests import Request
from strawberry import UNSET, Info

from phoenix.db import models
from phoenix.server.api.auth import IsLocked, IsNotReadOnly
from phoenix.server.api.context import Context
from phoenix.server.api.exceptions import BadRequest, NotFound, Unauthorized
from phoenix.server.api.input_types.CreateTraceAnnotationInput import CreateTraceAnnotationInput
from phoenix.server.api.input_types.DeleteAnnotationsInput import DeleteAnnotationsInput
from phoenix.server.api.input_types.PatchAnnotationInput import PatchAnnotationInput
from phoenix.server.api.queries import Query
from phoenix.server.api.types.node import from_global_id_with_expected_type
from phoenix.server.api.types.TraceAnnotation import TraceAnnotation, to_gql_trace_annotation
from phoenix.server.bearer_auth import PhoenixUser
from phoenix.server.dml_event import TraceAnnotationDeleteEvent, TraceAnnotationInsertEvent


@strawberry.type
class TraceAnnotationMutationPayload:
    trace_annotations: list[TraceAnnotation]
    query: Query


@strawberry.type
class TraceAnnotationMutationMixin:
    @strawberry.mutation(permission_classes=[IsNotReadOnly, IsLocked])  # type: ignore
    async def create_trace_annotations(
        self, info: Info[Context, None], input: list[CreateTraceAnnotationInput]
    ) -> TraceAnnotationMutationPayload:
        if not input:
            raise BadRequest("No trace annotations provided.")

        assert isinstance(request := info.context.request, Request)
        user_id: Optional[int] = None
        if "user" in request.scope and isinstance((user := info.context.user), PhoenixUser):
            user_id = int(user.identity)

        processed_annotations: dict[int, models.TraceAnnotation] = {}

        async with info.context.db() as session:
            dialect_name = session.bind.dialect.name  # type: ignore

            for idx, annotation_input in enumerate(input):
                try:
                    trace_rowid = from_global_id_with_expected_type(
                        annotation_input.trace_id, "Trace"
                    )
                except ValueError:
                    raise BadRequest(
                        f"Invalid trace ID for annotation at index {idx}: "
                        f"{annotation_input.trace_id}"
                    )

                values = {
                    "trace_rowid": trace_rowid,
                    "name": annotation_input.name,
                    "label": annotation_input.label,
                    "score": annotation_input.score,
                    "explanation": annotation_input.explanation,
                    "annotator_kind": annotation_input.annotator_kind.value,
                    "metadata_": annotation_input.metadata,
                    "identifier": annotation_input.identifier,
                    "source": annotation_input.source.value,
                    "user_id": user_id,
                }

                stmt = insert(models.TraceAnnotation).values(**values)

                if values.get("identifier") is not None:
                    update_fields = {
                        "name": stmt.excluded.name,
                        "label": stmt.excluded.label,
                        "score": stmt.excluded.score,
                        "explanation": stmt.excluded.explanation,
                        "metadata_": stmt.excluded.metadata_,
                        "annotator_kind": stmt.excluded.annotator_kind,
                        "source": stmt.excluded.source,
                        "user_id": stmt.excluded.user_id,
                    }
                    if dialect_name == "postgresql":
                        pg_stmt = postgresql.insert(models.TraceAnnotation).values(**values)
                        stmt = pg_stmt.on_conflict_do_update(
                            constraint="uq_trace_annotation_identifier_per_trace",
                            set_=update_fields,
                        ).returning(models.TraceAnnotation)
                    elif dialect_name == "sqlite":
                        sqlite_stmt = sqlite.insert(models.TraceAnnotation).values(**values)
                        stmt = sqlite_stmt.on_conflict_do_update(
                            index_elements=["trace_rowid", "identifier"],
                            index_where=models.TraceAnnotation.identifier.isnot(None),
                            set_=update_fields,
                        ).returning(models.TraceAnnotation)
                    # else: Handle other dialects if needed
                else:
                    stmt = stmt.returning(models.TraceAnnotation)

                result = await session.scalars(stmt)
                processed_annotation = result.one()
                processed_annotations[idx] = processed_annotation

        inserted_annotation_ids = tuple(anno.id for anno in processed_annotations.values())
        if inserted_annotation_ids:
            info.context.event_queue.put(TraceAnnotationInsertEvent(inserted_annotation_ids))

        returned_annotations = [
            to_gql_trace_annotation(processed_annotations[i])
            for i in sorted(processed_annotations.keys())
        ]

        return TraceAnnotationMutationPayload(
            trace_annotations=returned_annotations,
            query=Query(),
        )

    @strawberry.mutation(permission_classes=[IsNotReadOnly, IsLocked])  # type: ignore
    async def patch_trace_annotations(
        self, info: Info[Context, None], input: list[PatchAnnotationInput]
    ) -> TraceAnnotationMutationPayload:
        if not input:
            raise BadRequest("No trace annotations provided.")

        assert isinstance(request := info.context.request, Request)
        user_id: Optional[int] = None
        if "user" in request.scope and isinstance((user := info.context.user), PhoenixUser):
            user_id = int(user.identity)

        patch_by_id = {}
        for patch in input:
            try:
                trace_annotation_id = from_global_id_with_expected_type(
                    patch.annotation_id, "TraceAnnotation"
                )
            except ValueError:
                raise BadRequest(f"Invalid trace annotation ID: {patch.annotation_id}")
            if trace_annotation_id in patch_by_id:
                raise BadRequest(f"Duplicate patch for trace annotation ID: {trace_annotation_id}")
            patch_by_id[trace_annotation_id] = patch

        async with info.context.db() as session:
            trace_annotations_by_id = {}
            for trace_annotation in await session.scalars(
                select(models.TraceAnnotation).where(
                    models.TraceAnnotation.id.in_(patch_by_id.keys())
                )
            ):
                if trace_annotation.user_id != user_id:
                    raise Unauthorized(
                        "At least one trace annotation is not associated with the current user."
                    )
                trace_annotations_by_id[trace_annotation.id] = trace_annotation

            missing_trace_annotation_ids = set(patch_by_id.keys()) - set(
                trace_annotations_by_id.keys()
            )
            if missing_trace_annotation_ids:
                raise NotFound(
                    f"Could not find trace annotations with IDs: {missing_trace_annotation_ids}"
                )

            for trace_annotation_id, patch in patch_by_id.items():
                trace_annotation = trace_annotations_by_id[trace_annotation_id]
                if patch.name:
                    trace_annotation.name = patch.name
                if patch.annotator_kind:
                    trace_annotation.annotator_kind = patch.annotator_kind.value
                if patch.label is not UNSET:
                    trace_annotation.label = patch.label
                if patch.score is not UNSET:
                    trace_annotation.score = patch.score
                if patch.explanation is not UNSET:
                    trace_annotation.explanation = patch.explanation
                if patch.metadata is not UNSET:
                    assert isinstance(patch.metadata, dict)
                    trace_annotation.metadata_ = patch.metadata
                if patch.identifier is not UNSET:
                    trace_annotation.identifier = patch.identifier
                session.add(trace_annotation)
            await session.commit()

        patched_annotations = [
            to_gql_trace_annotation(trace_annotation)
            for trace_annotation in trace_annotations_by_id.values()
        ]
        info.context.event_queue.put(TraceAnnotationInsertEvent(tuple(patch_by_id.keys())))
        return TraceAnnotationMutationPayload(
            trace_annotations=patched_annotations,
            query=Query(),
        )

    @strawberry.mutation(permission_classes=[IsNotReadOnly])  # type: ignore
    async def delete_trace_annotations(
        self, info: Info[Context, None], input: DeleteAnnotationsInput
    ) -> TraceAnnotationMutationPayload:
        if not input.annotation_ids:
            raise BadRequest("No trace annotation IDs provided.")

        trace_annotation_ids: dict[int, None] = {}  # use dict to preserve order
        for annotation_gid in input.annotation_ids:
            try:
                annotation_id = from_global_id_with_expected_type(annotation_gid, "TraceAnnotation")
            except ValueError:
                raise BadRequest(f"Invalid trace annotation ID: {annotation_gid}")
            if annotation_id in trace_annotation_ids:
                raise BadRequest(f"Duplicate trace annotation ID: {annotation_id}")
            trace_annotation_ids[annotation_id] = None

        assert isinstance(request := info.context.request, Request)
        user_id: Optional[int] = None
        user_is_admin = False
        if "user" in request.scope and isinstance((user := info.context.user), PhoenixUser):
            user_id = int(user.identity)
            user_is_admin = user.is_admin

        async with info.context.db() as session:
            result = await session.scalars(
                delete(models.TraceAnnotation)
                .where(models.TraceAnnotation.id.in_(trace_annotation_ids.keys()))
                .returning(models.TraceAnnotation)
            )
            deleted_annotations_by_id = {annotation.id: annotation for annotation in result.all()}

            if not user_is_admin and any(
                annotation.user_id != user_id for annotation in deleted_annotations_by_id.values()
            ):
                await session.rollback()
                raise Unauthorized(
                    "At least one trace annotation is not associated with the current user "
                    "and the current user is not an admin."
                )

            missing_trace_annotation_ids = set(trace_annotation_ids.keys()) - set(
                deleted_annotations_by_id.keys()
            )
            if missing_trace_annotation_ids:
                raise NotFound(
                    f"Could not find trace annotations with IDs: {missing_trace_annotation_ids}"
                )

        deleted_gql_annotations = [
            to_gql_trace_annotation(deleted_annotations_by_id[id]) for id in trace_annotation_ids
        ]
        info.context.event_queue.put(
            TraceAnnotationDeleteEvent(tuple(deleted_annotations_by_id.keys()))
        )
        return TraceAnnotationMutationPayload(
            trace_annotations=deleted_gql_annotations, query=Query()
        )
