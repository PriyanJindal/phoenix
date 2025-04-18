import React, {
  startTransition,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FocusScope } from "react-aria";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

import { Card } from "@arizeai/components";

import {
  Button,
  Dialog,
  DialogTrigger,
  Flex,
  Icon,
  Icons,
  Loading,
  Popover,
  View,
} from "@phoenix/components";
import { Annotation, AnnotationConfig } from "@phoenix/components/annotation";
import { Empty } from "@phoenix/components/Empty";
import { SpanAnnotationsEditorCreateAnnotationMutation } from "@phoenix/components/trace/__generated__/SpanAnnotationsEditorCreateAnnotationMutation.graphql";
import { SpanAnnotationsEditorDeleteAnnotationMutation } from "@phoenix/components/trace/__generated__/SpanAnnotationsEditorDeleteAnnotationMutation.graphql";
import { SpanAnnotationsEditorSpanAnnotationsListQuery } from "@phoenix/components/trace/__generated__/SpanAnnotationsEditorSpanAnnotationsListQuery.graphql";
import { AnnotationConfigList } from "@phoenix/components/trace/AnnotationConfigList";
import {
  AnnotationFormMutationResult,
  AnnotationFormProvider,
} from "@phoenix/components/trace/AnnotationFormProvider";
import { useViewer } from "@phoenix/contexts/ViewerContext";
import { deduplicateAnnotationsByName } from "@phoenix/pages/trace/utils";
import { Mutable } from "@phoenix/typeUtils";

import { SpanAnnotationsEditor_spanAnnotations$key } from "./__generated__/SpanAnnotationsEditor_spanAnnotations.graphql";
import { SpanAnnotationsEditorEditAnnotationMutation } from "./__generated__/SpanAnnotationsEditorEditAnnotationMutation.graphql";
import { AnnotationFormData, SpanAnnotationInput } from "./SpanAnnotationInput";

export type SpanAnnotationsEditorProps = {
  spanNodeId: string;
  projectId: string;
};

export function SpanAnnotationsEditor(props: SpanAnnotationsEditorProps) {
  const { projectId, spanNodeId } = props;
  const [newAnnotationName, setNewAnnotationName] = useState<string | null>(
    null
  );
  return (
    <View height="100%" maxHeight="100%" overflow="auto">
      <Flex direction="column" height="100%">
        <View
          paddingY="size-100"
          paddingX="size-100"
          borderBottomWidth="thin"
          borderColor="dark"
          width="100%"
          flex="none"
        >
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="end"
            width="100%"
          >
            <NewAnnotationButton
              projectId={projectId}
              spanNodeId={spanNodeId}
              disabled={newAnnotationName !== null}
              onAnnotationNameSelect={setNewAnnotationName}
            />
          </Flex>
        </View>
        <Suspense>
          <SpanAnnotationsList spanId={spanNodeId} projectId={projectId} />
        </Suspense>
      </Flex>
    </View>
  );
}

type NewAnnotationButtonProps = {
  projectId: string;
  spanNodeId: string;
  disabled?: boolean;
  onAnnotationNameSelect: (name: string) => void;
};

function NewAnnotationButton(props: NewAnnotationButtonProps) {
  const {
    projectId,
    disabled = false,
    spanNodeId,
    onAnnotationNameSelect,
  } = props;
  const [popoverRef, setPopoverRef] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <DialogTrigger>
        <Button
          variant={disabled ? "default" : "primary"}
          isDisabled={disabled}
          size="S"
          leadingVisual={<Icon svg={<Icons.PlusCircleOutline />} />}
        >
          Add Annotation
        </Button>
        <Popover
          style={{ border: "none" }}
          placement="bottom end"
          crossOffset={300}
          UNSTABLE_portalContainer={popoverRef ?? undefined}
        >
          <Dialog>
            {({ close }) => (
              <NewAnnotationCard
                projectId={projectId}
                spanNodeId={spanNodeId}
                onAnnotationNameSelect={(name) => {
                  onAnnotationNameSelect(name);
                }}
                onClose={close}
              />
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
      <div ref={setPopoverRef} />
    </>
  );
}

type NewAnnotationCardProps = {
  projectId: string;
  spanNodeId: string;
  onClose: () => void;
  onAnnotationNameSelect: (name: string) => void;
};

function NewAnnotationCard(props: NewAnnotationCardProps) {
  const { projectId, spanNodeId, onClose } = props;
  return (
    <Card
      title="Add Annotation from Config"
      backgroundColor="light"
      borderColor="light"
      variant="compact"
      bodyStyle={{ padding: 0 }}
    >
      <Suspense>
        <NewAnnotationFromConfig
          projectId={projectId}
          spanId={spanNodeId}
          onClose={onClose}
        />
      </Suspense>
    </Card>
  );
}

function SpanAnnotationsList(props: {
  spanId: string;
  projectId: string;
  extraAnnotationCards?: React.ReactNode;
}) {
  const { spanId, projectId, extraAnnotationCards } = props;
  const { viewer } = useViewer();

  const data = useLazyLoadQuery<SpanAnnotationsEditorSpanAnnotationsListQuery>(
    graphql`
      query SpanAnnotationsEditorSpanAnnotationsListQuery(
        $projectId: GlobalID!
        $spanId: GlobalID!
        $filterUserIds: [GlobalID!]
      ) {
        project: node(id: $projectId) {
          id
          ... on Project {
            annotationConfigs {
              configs: edges {
                config: node {
                  __typename
                  ... on Node {
                    id
                  }
                  ... on AnnotationConfigBase {
                    name
                    annotationType
                    description
                  }
                  ... on CategoricalAnnotationConfig {
                    optimizationDirection
                    values {
                      label
                      score
                    }
                  }
                  ... on ContinuousAnnotationConfig {
                    lowerBound
                    upperBound
                    optimizationDirection
                  }
                  ... on FreeformAnnotationConfig {
                    name
                  }
                }
              }
            }
          }
        }
        span: node(id: $spanId) {
          id
          ... on Span {
            ...SpanAnnotationsEditor_spanAnnotations
              @arguments(filterUserIds: $filterUserIds)
          }
        }
      }
    `,
    {
      projectId,
      spanId,
      filterUserIds: viewer?.id ? [viewer.id] : null,
    }
  );
  const span = useFragment<SpanAnnotationsEditor_spanAnnotations$key>(
    graphql`
      fragment SpanAnnotationsEditor_spanAnnotations on Span
      @argumentDefinitions(filterUserIds: { type: "[GlobalID!]" }) {
        id
        filteredSpanAnnotations: spanAnnotations(
          filter: {
            exclude: { names: ["note"] }
            include: { userIds: $filterUserIds }
          }
        ) {
          id
          name
          annotatorKind
          score
          label
          explanation
          createdAt
        }
      }
    `,
    data.span
  );
  const spanNodeId = data.span.id;
  const spanAnnotations = span.filteredSpanAnnotations as Mutable<
    typeof span.filteredSpanAnnotations
  >;
  const annotations = useMemo(() => {
    // we can only show one config per annotation name
    // so we need to group by name and pick the most recent one
    return deduplicateAnnotationsByName(spanAnnotations);
  }, [spanAnnotations]);
  const currentAnnotationIds = useMemo(
    () => new Set(annotations.map((annotation) => annotation.id)),
    [annotations]
  );
  const annotationConfigs = data.project?.annotationConfigs?.configs;
  const annotationConfigsLength = annotationConfigs?.length ?? 0;

  const [commitDeleteAnnotation] =
    useMutation<SpanAnnotationsEditorDeleteAnnotationMutation>(graphql`
      mutation SpanAnnotationsEditorDeleteAnnotationMutation(
        $spanId: GlobalID!
        $annotationIds: [GlobalID!]!
        $filterUserIds: [GlobalID!]
      ) {
        deleteSpanAnnotations(input: { annotationIds: $annotationIds }) {
          query {
            node(id: $spanId) {
              ... on Span {
                ...SpanAnnotationsEditor_spanAnnotations
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanAsideAnnotationList_span
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanFeedback_annotations
              }
            }
          }
        }
      }
    `);
  const handleDelete = useCallback(
    (annotation: Annotation) =>
      new Promise<AnnotationFormMutationResult>((resolve) => {
        if (annotation.id) {
          commitDeleteAnnotation({
            variables: {
              spanId: spanNodeId,
              annotationIds: [annotation.id],
              filterUserIds: viewer?.id ? [viewer.id] : null,
            },
            onCompleted: () => {
              resolve({
                success: true,
              });
            },
            onError: (error) => {
              resolve({
                success: false,
                error: error.message,
              });
            },
          });
        } else {
          resolve({
            success: true,
          });
        }
      }),
    [commitDeleteAnnotation, spanNodeId, viewer?.id]
  );

  const [commitEdit] = useMutation<SpanAnnotationsEditorEditAnnotationMutation>(
    graphql`
      mutation SpanAnnotationsEditorEditAnnotationMutation(
        $spanId: GlobalID!
        $annotationId: GlobalID!
        $name: String!
        $label: String
        $score: Float
        $explanation: String
        $filterUserIds: [GlobalID!]
      ) {
        patchSpanAnnotations(
          input: [
            {
              annotationId: $annotationId
              name: $name
              label: $label
              score: $score
              explanation: $explanation
              annotatorKind: HUMAN
            }
          ]
        ) {
          query {
            node(id: $spanId) {
              ... on Span {
                ...SpanAnnotationsEditor_spanAnnotations
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanAsideAnnotationList_span
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanFeedback_annotations
              }
            }
          }
        }
      }
    `
  );
  const handleEdit = useCallback(
    (data: Annotation) => {
      return new Promise<AnnotationFormMutationResult>((resolve) => {
        const annotationId = data.id;
        if (annotationId) {
          startTransition(() => {
            commitEdit({
              variables: {
                annotationId,
                spanId: spanNodeId,
                name: data.name,
                label: data.label,
                score: data.score,
                explanation: data.explanation || null,
                filterUserIds: viewer?.id ? [viewer.id] : null,
              },
              onCompleted: () => {
                resolve({
                  success: true,
                });
              },
              onError: (error) => {
                resolve({
                  success: false,
                  error: error.message,
                });
              },
            });
          });
        }
      });
    },
    [commitEdit, spanNodeId, viewer?.id]
  );

  const [commitCreateAnnotation] =
    useMutation<SpanAnnotationsEditorCreateAnnotationMutation>(graphql`
      mutation SpanAnnotationsEditorCreateAnnotationMutation(
        $input: CreateSpanAnnotationInput!
        $spanId: GlobalID!
        $filterUserIds: [GlobalID!]
      ) {
        createSpanAnnotations(input: [$input]) {
          query {
            node(id: $spanId) {
              ... on Span {
                ...SpanAnnotationsEditor_spanAnnotations
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanAsideAnnotationList_span
                  @arguments(filterUserIds: $filterUserIds)
                ...SpanFeedback_annotations
              }
            }
          }
        }
      }
    `);
  const handleCreate = useCallback(
    (data: AnnotationFormData) =>
      new Promise<AnnotationFormMutationResult>((resolve) => {
        commitCreateAnnotation({
          variables: {
            input: {
              ...data,
              spanId: spanNodeId,
              annotatorKind: "HUMAN",
              explanation: data.explanation || null,
              source: "APP",
            },
            spanId: spanNodeId,
            filterUserIds: viewer?.id ? [viewer.id] : null,
          },
          onCompleted: () => {
            resolve({
              success: true,
            });
          },
          onError: (error) => {
            resolve({
              success: false,
              error: error.message,
            });
          },
        });
      }),
    [commitCreateAnnotation, spanNodeId, viewer?.id]
  );

  return (
    <View
      height="100%"
      maxHeight="100%"
      overflow="auto"
      width="100%"
      padding="size-200"
    >
      {!annotationConfigsLength && !extraAnnotationCards && (
        <Empty
          graphicKey="documents"
          message="No annotation configurations for this project"
        />
      )}
      {!!annotationConfigsLength && (
        <FocusScope autoFocus>
          {annotationConfigs?.map((annotationConfig, idx) => {
            const annotation = annotations.find(
              (annotation) => annotation.name === annotationConfig.config.name
            );
            return (
              <AnnotationFormProvider
                key={`${idx}_${annotationConfig.config.name}_form`}
                annotationConfig={annotationConfig.config as AnnotationConfig}
                currentAnnotationIDs={currentAnnotationIds}
                annotation={annotation}
                onCreate={handleCreate}
                onUpdate={handleEdit}
                onDelete={handleDelete}
              >
                <SpanAnnotationInput
                  annotation={annotation}
                  annotationConfig={annotationConfig.config as AnnotationConfig}
                />
              </AnnotationFormProvider>
            );
          })}
        </FocusScope>
      )}
    </View>
  );
}

function NewAnnotationFromConfig(props: {
  projectId: string;
  spanId: string;
  onClose: () => void;
}) {
  const { projectId, spanId } = props;
  return (
    <View minWidth={320}>
      <Suspense fallback={<Loading />}>
        <Flex direction="column" gap="size-100">
          <AnnotationConfigList projectId={projectId} spanId={spanId} />
        </Flex>
      </Suspense>
    </View>
  );
}
