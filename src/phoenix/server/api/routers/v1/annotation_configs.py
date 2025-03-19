import logging
from enum import Enum
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload
from starlette.requests import Request
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_422_UNPROCESSABLE_ENTITY,
)
from strawberry.relay import GlobalID
from typing_extensions import assert_never

from phoenix.db import models
from phoenix.server.api.types.AnnotationConfig import (
    CategoricalAnnotationConfig,
    ContinuousAnnotationConfig,
    FreeformAnnotationConfig,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["annotation_configs"])


class CategoricalAnnotationValue(BaseModel):
    label: str
    score: Optional[float] = None


class OptimizationDirection(Enum):
    MINIMIZE = "MINIMIZE"
    MAXIMIZE = "MAXIMIZE"


class AnnotationType(Enum):
    CONTINUOUS = "CONTINUOUS"
    CATEGORICAL = "CATEGORICAL"
    FREEFORM = "FREEFORM"


class AnnotationConfigResponse(BaseModel):
    id: str
    name: str
    annotation_type: AnnotationType
    optimization_direction: Optional[OptimizationDirection] = None
    description: Optional[str] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    values: Optional[List[CategoricalAnnotationValue]] = None


def annotation_config_to_response(config: models.AnnotationConfig) -> AnnotationConfigResponse:
    """Convert an AnnotationConfig SQLAlchemy model instance to our response model."""
    base: dict[str, Any] = {
        "name": config.name,
        "annotation_type": config.annotation_type,
        "description": config.description,
    }
    annotation_type = AnnotationType(config.annotation_type)
    if annotation_type is AnnotationType.CONTINUOUS:
        base["id"] = str(GlobalID(ContinuousAnnotationConfig.__name__, str(config.id)))
        base["optimization_direction"] = config.continuous_annotation_config.optimization_direction
        base["lower_bound"] = config.continuous_annotation_config.lower_bound
        base["upper_bound"] = config.continuous_annotation_config.upper_bound
    elif annotation_type is AnnotationType.CATEGORICAL:
        base["id"] = str(GlobalID(CategoricalAnnotationConfig.__name__, str(config.id)))
        base["optimization_direction"] = config.categorical_annotation_config.optimization_direction
        base["values"] = [
            CategoricalAnnotationValue(label=val.label, score=val.score)
            for val in config.categorical_annotation_config.values
        ]
    elif annotation_type is AnnotationType.FREEFORM:
        base["id"] = str(GlobalID(FreeformAnnotationConfig.__name__, str(config.id)))
    else:
        assert_never(annotation_type)
    return AnnotationConfigResponse(**base)


class CreateContinuousAnnotationConfigPayload(BaseModel):
    name: str
    optimization_direction: OptimizationDirection
    description: Optional[str] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None


class CreateCategoricalAnnotationValuePayload(BaseModel):
    label: str
    score: Optional[float] = None


class CreateCategoricalAnnotationConfigPayload(BaseModel):
    name: str
    optimization_direction: OptimizationDirection
    description: Optional[str] = None
    values: List[CreateCategoricalAnnotationValuePayload]


class CreateFreeformAnnotationConfigPayload(BaseModel):
    name: str
    description: Optional[str] = None


@router.get(
    "/annotation_configs",
    response_model=List[AnnotationConfigResponse],
    summary="List annotation configurations",
)
async def list_annotation_configs(
    request: Request,
    limit: int = Query(50, gt=0, description="Maximum number of configs to return"),
) -> List[AnnotationConfigResponse]:
    async with request.app.state.db() as session:
        result = await session.execute(
            select(models.AnnotationConfig)
            .options(
                selectinload(models.AnnotationConfig.continuous_annotation_config),
                selectinload(models.AnnotationConfig.categorical_annotation_config).selectinload(
                    models.CategoricalAnnotationConfig.values
                ),
            )
            .order_by(models.AnnotationConfig.name)
            .limit(limit)
        )
        configs = result.scalars().all()
        return [annotation_config_to_response(config) for config in configs]


@router.get(
    "/annotation_configs/{config_identifier}",
    response_model=AnnotationConfigResponse,
    summary="Get an annotation configuration by ID or name",
)
async def get_annotation_config_by_name_or_id(
    request: Request,
    config_identifier: str = Path(..., description="ID or name of the annotation configuration"),
) -> AnnotationConfigResponse:
    async with request.app.state.db() as session:
        query = select(models.AnnotationConfig).options(
            selectinload(models.AnnotationConfig.continuous_annotation_config),
            selectinload(models.AnnotationConfig.categorical_annotation_config).selectinload(
                models.CategoricalAnnotationConfig.values
            ),
        )
        # Try to interpret the identifier as an integer ID; if not, use it as a name.
        try:
            db_id = _get_annotation_config_db_id(config_identifier)
            query = query.where(models.AnnotationConfig.id == db_id)
        except ValueError:
            query = query.where(models.AnnotationConfig.name == config_identifier)
        config = await session.scalar(query)
        if not config:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND, detail="Annotation configuration not found"
            )
        return annotation_config_to_response(config)


@router.post(
    "/annotation_configs/continuous",
    response_model=AnnotationConfigResponse,
    summary="Create a continuous annotation configuration",
)
async def create_continuous_annotation_config(
    request: Request,
    payload: CreateContinuousAnnotationConfigPayload,
) -> AnnotationConfigResponse:
    async with request.app.state.db() as session:
        annotation_config = models.AnnotationConfig(
            name=payload.name,
            annotation_type="CONTINUOUS",
            description=payload.description,
        )
        continuous_annotation_config = models.ContinuousAnnotationConfig(
            optimization_direction=payload.optimization_direction.value,
            lower_bound=payload.lower_bound,
            upper_bound=payload.upper_bound,
        )
        annotation_config.continuous_annotation_config = continuous_annotation_config
        session.add(annotation_config)
        try:
            await session.commit()
        except Exception as e:
            raise HTTPException(status_code=HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        return annotation_config_to_response(annotation_config)


@router.post(
    "/annotation_configs/categorical",
    response_model=AnnotationConfigResponse,
    summary="Create a categorical annotation configuration",
)
async def create_categorical_annotation_config(
    request: Request,
    payload: CreateCategoricalAnnotationConfigPayload,
) -> AnnotationConfigResponse:
    async with request.app.state.db() as session:
        annotation_config = models.AnnotationConfig(
            name=payload.name,
            annotation_type="CATEGORICAL",
            description=payload.description,
        )
        categorical_annotation_config = models.CategoricalAnnotationConfig(
            optimization_direction=payload.optimization_direction.value,
        )
        for value in payload.values:
            categorical_annotation_config.values.append(
                models.CategoricalAnnotationValue(
                    label=value.label,
                    score=value.score,
                )
            )
        annotation_config.categorical_annotation_config = categorical_annotation_config
        session.add(annotation_config)
        try:
            await session.commit()
        except Exception as e:
            raise HTTPException(status_code=HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        return annotation_config_to_response(annotation_config)


@router.post(
    "/annotation_configs/freeform",
    response_model=AnnotationConfigResponse,
    summary="Create a freeform annotation configuration",
)
async def create_freeform_annotation_config(
    request: Request,
    payload: CreateFreeformAnnotationConfigPayload,
) -> AnnotationConfigResponse:
    async with request.app.state.db() as session:
        annotation_config = models.AnnotationConfig(
            name=payload.name,
            annotation_type="FREEFORM",
            description=payload.description,
        )
        session.add(annotation_config)
        try:
            await session.commit()
        except Exception as e:
            raise HTTPException(status_code=HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        return annotation_config_to_response(annotation_config)


@router.delete(
    "/annotation_configs/{config_id}",
    response_model=bool,
    summary="Delete an annotation configuration",
)
async def delete_annotation_config(
    request: Request,
    config_id: str = Path(..., description="ID of the annotation configuration"),
) -> bool:
    config_gid = GlobalID.from_id(config_id)
    if config_gid.type_name not in (
        CategoricalAnnotationConfig.__name__,
        ContinuousAnnotationConfig.__name__,
        FreeformAnnotationConfig.__name__,
    ):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail="Invalid annotation configuration ID"
        )
    config_rowid = int(config_gid.node_id)
    async with request.app.state.db() as session:
        stmt = delete(models.AnnotationConfig).where(models.AnnotationConfig.id == config_rowid)
        result = await session.execute(stmt)
        if result.rowcount == 0:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND, detail="Annotation configuration not found"
            )
        await session.commit()
    return True


def _get_annotation_config_db_id(config_gid: str) -> int:
    gid = GlobalID.from_id(config_gid)
    type_name, node_id = gid.type_name, int(gid.node_id)
    if type_name not in (
        CategoricalAnnotationConfig.__name__,
        ContinuousAnnotationConfig.__name__,
        FreeformAnnotationConfig.__name__,
    ):
        raise ValueError(f"Invalid annotation configuration ID: {config_gid}")
    return node_id
