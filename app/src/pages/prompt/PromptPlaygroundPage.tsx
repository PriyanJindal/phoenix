import React, { useMemo } from "react";
import { useLoaderData } from "react-router";

import { PromptPlaygroundLoaderData } from "@phoenix/pages/prompt/promptPlaygroundLoader";
import {
  createNormalizedPlaygroundInstance,
  PlaygroundInstance,
} from "@phoenix/store";

import { Playground } from "../playground/Playground";
import { convertTemplateFormatToTemplateLanguage } from "../playground/playgroundUtils";

export function PromptPlaygroundPage() {
  const { instanceWithPrompt, templateFormat } =
    useLoaderData() as PromptPlaygroundLoaderData;

  // create a playground instance with the prompt details configured
  // When the playground component mounts and sees the prompt id in the instance,
  // it will automatically load the latest prompt version into the instance
  const { instance } = useMemo(() => {
    const { instance: defaultInstance } = createNormalizedPlaygroundInstance();

    const instance = {
      ...defaultInstance,
      ...instanceWithPrompt,
      // we don't want default messages in the instance, just the prompt messages
      template: instanceWithPrompt.template,
    } satisfies PlaygroundInstance;
    return { instance };
  }, [instanceWithPrompt]);

  return (
    <Playground
      instances={[instance]}
      templateLanguage={convertTemplateFormatToTemplateLanguage(templateFormat)}
    />
  );
}
