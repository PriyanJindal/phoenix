import React, { startTransition, useCallback, useMemo, useState } from "react";
import { FocusScope } from "react-aria";
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from "react-relay";
import { css } from "@emotion/react";

import { Tooltip, TooltipTrigger, TriggerWrap } from "@arizeai/components";

import {
  Button,
  Dialog,
  DialogTrigger,
  Flex,
  Icon,
  Icons,
  Input,
  Link,
  ListBox,
  ListBoxItem,
  Modal,
  Text,
  TextField,
  View,
} from "@phoenix/components";
import { AnnotationLabel } from "@phoenix/components/annotation";
import { AnnotationConfigListAssociateAnnotationConfigWithProjectMutation } from "@phoenix/components/trace/__generated__/AnnotationConfigListAssociateAnnotationConfigWithProjectMutation.graphql";
import { AnnotationConfigListProjectAnnotationConfigFragment$key } from "@phoenix/components/trace/__generated__/AnnotationConfigListProjectAnnotationConfigFragment.graphql";
import { AnnotationConfigListProjectAnnotationConfigQuery } from "@phoenix/components/trace/__generated__/AnnotationConfigListProjectAnnotationConfigQuery.graphql";
import {
  AnnotationConfigListQuery,
  AnnotationType,
} from "@phoenix/components/trace/__generated__/AnnotationConfigListQuery.graphql";
import { AnnotationConfigListRemoveAnnotationConfigFromProjectMutation } from "@phoenix/components/trace/__generated__/AnnotationConfigListRemoveAnnotationConfigFromProjectMutation.graphql";

const annotationListBoxCSS = css`
  padding: 0 var(--ac-global-dimension-size-100);
  max-height: 300px;
  min-width: 320px;
  min-height: 20px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  .react-aria-ListBoxItem {
    padding: 0 var(--ac-global-dimension-size-100);

    label {
      border-radius: var(--ac-global-rounding-small);
      padding: var(--ac-global-dimension-size-50) 0;
      width: 100%;
      &:hover {
        background-color: var(--ac-global-color-grey-300);
      }
    }
  }
`;

const annotationLabelCSS = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--ac-global-dimension-size-100);
`;

const annotationTypeLabelMap: Record<AnnotationType, string> = {
  ["CATEGORICAL"]: "Categorical",
  ["CONTINUOUS"]: "Continuous",
  ["FREEFORM"]: "Freeform",
};

export function AnnotationConfigList(props: {
  projectId: string;
  spanId: string;
  renderNewAnnotationForm: React.ReactNode;
}) {
  const [popoverRef, setPopoverRef] = useState<HTMLDivElement | null>(null);
  const { projectId, renderNewAnnotationForm } = props;
  const [filter, setFilter] = useState<string>("");
  const data = useLazyLoadQuery<AnnotationConfigListQuery>(
    graphql`
      query AnnotationConfigListQuery($projectId: GlobalID!) {
        project: node(id: $projectId) {
          ... on Project {
            ...AnnotationConfigListProjectAnnotationConfigFragment
          }
        }
        allAnnotationConfigs: annotationConfigs {
          edges {
            node {
              ... on Node {
                id
              }
              ... on AnnotationConfigBase {
                name
                annotationType
              }
            }
          }
        }
      }
    `,
    { projectId }
  );

  const [projectAnnotationData] = useRefetchableFragment<
    AnnotationConfigListProjectAnnotationConfigQuery,
    AnnotationConfigListProjectAnnotationConfigFragment$key
  >(
    graphql`
      fragment AnnotationConfigListProjectAnnotationConfigFragment on Project
      @refetchable(
        queryName: "AnnotationConfigListProjectAnnotationConfigQuery"
      ) {
        annotationConfigs {
          edges {
            node {
              ... on Node {
                id
              }
              ... on AnnotationConfigBase {
                name
                annotationType
              }
            }
          }
        }
      }
    `,
    data.project
  );
  // mutation to associate an annotation config with a project
  const [addAnnotationConfigToProjectMutation] =
    useMutation<AnnotationConfigListAssociateAnnotationConfigWithProjectMutation>(
      graphql`
        mutation AnnotationConfigListAssociateAnnotationConfigWithProjectMutation(
          $projectId: GlobalID!
          $annotationConfigId: GlobalID!
        ) {
          addAnnotationConfigToProject(
            input: {
              projectId: $projectId
              annotationConfigId: $annotationConfigId
            }
          ) {
            project {
              ...AnnotationConfigListProjectAnnotationConfigFragment
            }
          }
        }
      `
    );
  // mutation to remove an annotation config from a project
  const [removeAnnotationConfigFromProjectMutation] =
    useMutation<AnnotationConfigListRemoveAnnotationConfigFromProjectMutation>(
      graphql`
        mutation AnnotationConfigListRemoveAnnotationConfigFromProjectMutation(
          $projectId: GlobalID!
          $annotationConfigId: GlobalID!
        ) {
          removeAnnotationConfigFromProject(
            input: {
              projectId: $projectId
              annotationConfigId: $annotationConfigId
            }
          ) {
            project {
              ...AnnotationConfigListProjectAnnotationConfigFragment
            }
          }
        }
      `
    );

  const addAnnotationConfigToProject = useCallback(
    (annotationConfigId: string) => {
      startTransition(() => {
        addAnnotationConfigToProjectMutation({
          variables: {
            projectId,
            annotationConfigId,
          },
        });
      });
    },
    [projectId, addAnnotationConfigToProjectMutation]
  );

  const removeAnnotationConfigFromProject = useCallback(
    (annotationConfigId: string) => {
      removeAnnotationConfigFromProjectMutation({
        variables: {
          projectId,
          annotationConfigId,
        },
      });
    },
    [projectId, removeAnnotationConfigFromProjectMutation]
  );

  const allAnnotationConfigs = data.allAnnotationConfigs.edges;
  const projectAnnotationConfigs =
    projectAnnotationData.annotationConfigs?.edges;
  const annotationConfigIdInProject = useMemo(() => {
    return new Set(projectAnnotationConfigs?.map((config) => config.node.id));
  }, [projectAnnotationConfigs]);
  const filteredAnnotationConfigs = useMemo(() => {
    return allAnnotationConfigs.filter((config) =>
      config.node.name?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [allAnnotationConfigs, filter]);
  const toggleAnnotationConfigInProject = useCallback(
    (annotationConfigId: string) => {
      if (annotationConfigIdInProject.has(annotationConfigId)) {
        removeAnnotationConfigFromProject(annotationConfigId);
      } else {
        addAnnotationConfigToProject(annotationConfigId);
      }
    },
    [
      annotationConfigIdInProject,
      addAnnotationConfigToProject,
      removeAnnotationConfigFromProject,
    ]
  );
  return (
    <>
      <View paddingTop="size-100" maxWidth={320}>
        <FocusScope autoFocus contain>
          <Flex direction="column" gap="size-100">
            <View paddingX="size-100" paddingY="size-100">
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap="size-100"
              >
                <TextField
                  aria-label="Search annotation configs"
                  value={filter}
                  onChange={(value) => {
                    setFilter(value);
                  }}
                >
                  <Input placeholder="Search annotation configs" />
                </TextField>
                <DialogTrigger>
                  <TooltipTrigger>
                    <TriggerWrap>
                      <Button aria-label="Create annotation config">
                        <Icon svg={<Icons.PlusCircleOutline />} />
                      </Button>
                    </TriggerWrap>
                    <Tooltip>Create new annotation config</Tooltip>
                  </TooltipTrigger>
                  <Modal
                    isDismissable
                    UNSTABLE_portalContainer={popoverRef ?? undefined}
                  >
                    <Dialog>{renderNewAnnotationForm}</Dialog>
                  </Modal>
                </DialogTrigger>
              </Flex>
            </View>
            <ListBox
              css={annotationListBoxCSS}
              selectionMode="single"
              selectionBehavior="toggle"
              aria-label="Annotation Configs"
              renderEmptyState={() => (
                <View width="100%" height="100%">
                  <Flex
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {filter ? (
                      <Text
                        style={{
                          whiteSpace: "pre-wrap",
                          textAlign: "center",
                        }}
                      >
                        No annotation configs found for &quot;{filter}&quot;
                      </Text>
                    ) : (
                      <Link to="/settings/annotations">
                        Configure Annotation Configs
                      </Link>
                    )}
                  </Flex>
                </View>
              )}
              onSelectionChange={(keys) => {
                if (keys === "all" || keys.size === 0) {
                  return;
                }
                const annotationConfigId = keys.values().next().value;
                toggleAnnotationConfigInProject(annotationConfigId);
              }}
            >
              {filteredAnnotationConfigs.map((config) => (
                <ListBoxItem
                  key={config.node.id}
                  id={config.node.id}
                  textValue={config.node.name}
                >
                  <Flex direction="row" alignItems="center">
                    <label css={annotationLabelCSS}>
                      <Flex direction="row" alignItems="center" gap="size-100">
                        <input
                          type="checkbox"
                          checked={annotationConfigIdInProject.has(
                            config.node.id
                          )}
                          readOnly
                        />
                        <AnnotationLabel
                          key={config.node.name}
                          annotation={{
                            name: config.node.name || "",
                          }}
                          annotationDisplayPreference="none"
                          css={css`
                            width: fit-content;
                          `}
                        />
                      </Flex>
                      <span>
                        {annotationTypeLabelMap[
                          config.node.annotationType as AnnotationType
                        ] || config.node.annotationType}
                      </span>
                    </label>
                  </Flex>
                </ListBoxItem>
              ))}
            </ListBox>
          </Flex>
        </FocusScope>
      </View>
      <div ref={setPopoverRef} />
    </>
  );
}
