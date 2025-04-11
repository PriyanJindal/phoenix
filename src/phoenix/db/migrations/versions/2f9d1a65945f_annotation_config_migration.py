"""Annotation config migrations

Revision ID: 2f9d1a65945f
Revises: bc8fea3c2bc8
Create Date: 2025-02-06 10:17:15.726197

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2f9d1a65945f"
down_revision: Union[str, None] = "bc8fea3c2bc8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("span_annotations") as batch_op:
        batch_op.add_column(
            sa.Column(
                "user_id",
                sa.Integer,
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "identifier",
                sa.String,
                nullable=True,
                index=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "source",
                sa.String,
                sa.CheckConstraint(
                    "source IN ('API', 'APP')",
                    name="valid_source",
                ),
                nullable=False,
            ),
        )
        batch_op.drop_constraint(
            constraint_name="valid_annotator_kind",
            type_="check",
        )
        batch_op.create_check_constraint(
            constraint_name="valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'CODE', 'HUMAN')",
        )
        batch_op.drop_constraint("uq_span_annotations_name_span_rowid", type_="unique")
        batch_op.create_index(
            "uq_span_annotations_span_rowid_name_null_identifier",
            ["span_rowid", "name"],
            unique=True,
            postgresql_where=sa.column("identifier").is_(None),
            sqlite_where=sa.column("identifier").is_(None),
        )
        batch_op.create_index(
            "uq_span_annotations_span_rowid_name_identifier_not_null",
            ["span_rowid", "name", "identifier"],
            unique=True,
            postgresql_where=sa.column("identifier").isnot(None),
            sqlite_where=sa.column("identifier").isnot(None),
        )

    with op.batch_alter_table("trace_annotations") as batch_op:
        batch_op.add_column(
            sa.Column(
                "user_id",
                sa.Integer,
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "identifier",
                sa.String,
                nullable=True,
                index=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "source",
                sa.String,
                sa.CheckConstraint(
                    "source IN ('API', 'APP')",
                    name="valid_source",
                ),
                nullable=False,
            ),
        )
        batch_op.drop_constraint(
            constraint_name="valid_annotator_kind",
            type_="check",
        )
        batch_op.create_check_constraint(
            constraint_name="valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'CODE', 'HUMAN')",
        )
        batch_op.drop_constraint("uq_trace_annotations_name_trace_rowid", type_="unique")
        batch_op.create_index(
            "uq_trace_annotations_trace_rowid_name_null_identifier",
            ["trace_rowid", "name"],
            unique=True,
            postgresql_where=sa.column("identifier").is_(None),
            sqlite_where=sa.column("identifier").is_(None),
        )
        batch_op.create_index(
            "uq_trace_annotations_trace_rowid_name_identifier_not_null",
            ["trace_rowid", "name", "identifier"],
            unique=True,
            postgresql_where=sa.column("identifier").isnot(None),
            sqlite_where=sa.column("identifier").isnot(None),
        )

    with op.batch_alter_table("document_annotations") as batch_op:
        batch_op.add_column(
            sa.Column(
                "user_id",
                sa.Integer,
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
            ),
        )
        batch_op.drop_constraint(
            "uq_document_annotations_name_span_rowid_document_position",
            type_="unique",
        )
        batch_op.add_column(
            sa.Column(
                "identifier",
                sa.String,
                nullable=True,
                index=True,
                unique=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "source",
                sa.String,
                sa.CheckConstraint(
                    "source IN ('API', 'APP')",
                    name="valid_source",
                ),
                nullable=False,
            ),
        )
        batch_op.drop_constraint(
            constraint_name="valid_annotator_kind",
            type_="check",
        )
        batch_op.create_check_constraint(
            constraint_name="valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'CODE', 'HUMAN')",
        )

    op.create_table(
        "annotation_configs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, nullable=False, unique=True),
        sa.Column(
            "annotation_type",
            sa.String,
            sa.CheckConstraint(
                "annotation_type IN ('CATEGORICAL', 'CONTINUOUS', 'FREEFORM')",
                name="valid_annotation_type",
            ),
            nullable=False,
        ),
        sa.Column("description", sa.String, nullable=True),
    )

    op.create_table(
        "continuous_annotation_configs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "annotation_config_id",
            sa.Integer,
            sa.ForeignKey("annotation_configs.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "optimization_direction",
            sa.String,
            sa.CheckConstraint(
                "optimization_direction IN ('MINIMIZE', 'MAXIMIZE')",
                name="valid_optimization_direction",
            ),
            nullable=False,
        ),
        sa.Column("lower_bound", sa.Float, nullable=True),
        sa.Column("upper_bound", sa.Float, nullable=True),
    )

    op.create_table(
        "categorical_annotation_configs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "annotation_config_id",
            sa.Integer,
            sa.ForeignKey("annotation_configs.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "optimization_direction",
            sa.String,
            sa.CheckConstraint(
                "optimization_direction IN ('MINIMIZE', 'MAXIMIZE')",
                name="valid_optimization_direction",
            ),
            nullable=False,
        ),
    )

    op.create_table(
        "categorical_annotation_values",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "categorical_annotation_config_id",
            sa.Integer,
            sa.ForeignKey("categorical_annotation_configs.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("label", sa.String, nullable=False),
        sa.Column("score", sa.Float, nullable=True),
        sa.UniqueConstraint(
            "categorical_annotation_config_id",
            "label",
        ),
    )

    op.create_table(
        "project_annotation_configs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "project_id",
            sa.Integer,
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "annotation_config_id",
            sa.Integer,
            sa.ForeignKey("annotation_configs.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.UniqueConstraint(
            "project_id",
            "annotation_config_id",
        ),
    )


def downgrade() -> None:
    op.drop_table("project_annotation_configs")
    op.drop_table("categorical_annotation_values")
    op.drop_table("categorical_annotation_configs")
    op.drop_table("continuous_annotation_configs")
    op.drop_table("annotation_configs")

    with op.batch_alter_table("span_annotations") as batch_op:
        batch_op.drop_index("uq_span_annotations_span_rowid_name_identifier_not_null")
        batch_op.drop_index("uq_span_annotations_span_rowid_name_null_identifier")
        batch_op.drop_constraint("ck_span_annotations_`valid_source`", type_="check")
        batch_op.drop_constraint("valid_annotator_kind", type_="check")
        batch_op.drop_column("user_id")
        batch_op.drop_column("source")
        batch_op.drop_column("identifier")
        batch_op.create_unique_constraint(
            "uq_span_annotations_name_span_rowid", ["name", "span_rowid"]
        )
        batch_op.create_check_constraint(
            "valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'HUMAN')",
        )

    with op.batch_alter_table("trace_annotations") as batch_op:
        batch_op.drop_index("uq_trace_annotations_trace_rowid_name_identifier_not_null")
        batch_op.drop_index("uq_trace_annotations_trace_rowid_name_null_identifier")
        batch_op.drop_constraint("ck_trace_annotations_`valid_source`", type_="check")
        batch_op.drop_constraint("valid_annotator_kind", type_="check")
        batch_op.drop_column("user_id")
        batch_op.drop_column("source")
        batch_op.drop_column("identifier")
        batch_op.create_unique_constraint(
            "uq_trace_annotations_name_trace_rowid", ["name", "trace_rowid"]
        )
        batch_op.create_check_constraint(
            "valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'HUMAN')",
        )

    with op.batch_alter_table("document_annotations") as batch_op:
        batch_op.drop_index("ix_document_annotations_identifier")
        batch_op.drop_constraint("ck_document_annotations_`valid_source`", type_="check")
        batch_op.drop_constraint("valid_annotator_kind", type_="check")
        batch_op.drop_column("user_id")
        batch_op.drop_column("source")
        batch_op.drop_column("identifier")
        batch_op.create_unique_constraint(
            "uq_document_annotations_name_span_rowid_document_position",
            ["name", "span_rowid", "document_position"],
        )
        batch_op.create_check_constraint(
            "valid_annotator_kind",
            condition="annotator_kind IN ('LLM', 'HUMAN')",
        )
