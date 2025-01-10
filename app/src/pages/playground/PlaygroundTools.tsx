import React, { useMemo } from "react";

import { Counter, Form } from "@arizeai/components";

import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
  Flex,
  View,
} from "@phoenix/components";
import { ToolChoicePicker } from "@phoenix/components/generative";
import { usePlaygroundContext } from "@phoenix/contexts/PlaygroundContext";

import { PlaygroundTool } from "./PlaygroundTool";
import { getToolName } from "./playgroundUtils";
import { PlaygroundInstanceProps } from "./types";

interface PlaygroundToolsProps extends PlaygroundInstanceProps {}

export function PlaygroundTools(props: PlaygroundToolsProps) {
  const instanceId = props.playgroundInstanceId;
  const instance = usePlaygroundContext((state) =>
    state.instances.find(
      (instance) => instance.id === props.playgroundInstanceId
    )
  );
  const updateInstance = usePlaygroundContext((state) => state.updateInstance);
  if (instance == null) {
    throw new Error(`Playground instance ${instanceId} not found`);
  }
  const { tools } = instance;
  if (tools == null) {
    throw new Error(`Playground instance ${instanceId} does not have tools`);
  }

  const toolNames = useMemo(
    () =>
      tools
        .map((tool) => getToolName(tool))
        .filter((name): name is NonNullable<typeof name> => name != null),
    [tools]
  );

  return (
    <DisclosureGroup defaultExpandedKeys={["tools"]}>
      <Disclosure id="tools">
        <DisclosureTrigger arrowPosition="start">
          Tools
          <Counter variant="light">{tools.length}</Counter>
        </DisclosureTrigger>
        <DisclosurePanel>
          <View padding="size-200">
            <Flex direction="column">
              <Form>
                <ToolChoicePicker
                  choice={instance.toolChoice}
                  onChange={(choice) => {
                    updateInstance({
                      instanceId,
                      patch: {
                        toolChoice: choice,
                      },
                    });
                  }}
                  toolNames={toolNames}
                />
              </Form>
              <Flex direction={"column"} gap="size-200">
                {tools.map((tool) => {
                  return (
                    <PlaygroundTool
                      key={tool.id}
                      playgroundInstanceId={instanceId}
                      toolId={tool.id}
                    />
                  );
                })}
              </Flex>
            </Flex>
          </View>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
