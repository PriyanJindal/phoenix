import { assertUnreachable } from "../../../utils/assertUnreachable";
import { OpenAIToolDefinition } from "../openai/toolSchemas";
import { OpenAIMessage } from "../openai/messageSchemas";
import { OpenAIToolCall } from "../openai/toolCallSchemas";
import { OpenaiToolChoice } from "../openai/toolChoiceSchemas";
import { phoenixMessageSchema } from "./messageSchemas";
import {
  ToolCallPart,
  ToolResultPart,
  asToolResultPart,
  phoenixContentPartSchema,
} from "./messagePartSchemas";
import { phoenixToolCallSchema } from "./toolCallSchemas";
import { safelyStringifyJSON } from "../../../utils/safelyStringifyJSON";
import { OpenAIChatPartText } from "../openai/messagePartSchemas";
import { phoenixResponseFormatSchema } from "./responseFormatSchema";
import { OpenAIResponseFormat } from "../openai/responseFormatSchema";
import { phoenixToolDefinitionSchema } from "./toolSchemas";
import { phoenixToolChoiceSchema } from "./toolChoiceSchemas";
import { jsonSchemaZodSchema } from "../../jsonSchema";

/*
 * Conversion Functions
 *
 * These follow a hub-and-spoke model where OpenAI is the hub format.
 * All conversions between different formats go through OpenAI as an intermediate step.
 */

export const phoenixMessagePartToOpenAI = phoenixContentPartSchema.transform(
  (part) => {
    const type = part.type;
    switch (type) {
      case "text":
        return {
          type: "text",
          text: part.text.text,
        } satisfies OpenAIChatPartText;
      case "tool_call":
        return null;
      case "tool_result":
        return null;
      default:
        return assertUnreachable(type);
    }
  }
);

/**
 * Spoke → Hub: Convert a Prompt message to OpenAI format
 */
export const phoenixMessageToOpenAI = phoenixMessageSchema.transform(
  (prompt) => {
    // Special handling for TOOL role messages
    if (prompt.role === "TOOL") {
      const toolResult = prompt.content
        .map((part) => asToolResultPart(part))
        .find((part): part is ToolResultPart => !!part);

      if (!toolResult) {
        throw new Error("TOOL role message must have a ToolResultContentPart");
      }

      return {
        role: "tool",
        content:
          typeof toolResult.tool_result.result === "string"
            ? toolResult.tool_result.result
            : safelyStringifyJSON(toolResult.tool_result.result).json || "",
        tool_call_id: toolResult.tool_result.tool_call_id,
      } satisfies OpenAIMessage;
    }

    // Handle other roles
    const role = prompt.role;
    switch (role) {
      case "SYSTEM":
        return {
          role: "system",
          content: prompt.content
            .map((part) => phoenixMessagePartToOpenAI.parse(part))
            .filter(
              (part): part is OpenAIChatPartText =>
                part !== null && part.type === "text"
            ),
        } satisfies OpenAIMessage;
      case "USER":
        return {
          role: "user",
          content: prompt.content
            .map((part) => phoenixMessagePartToOpenAI.parse(part))
            .filter(
              (part): part is OpenAIChatPartText =>
                part !== null && part.type === "text"
            ),
        } satisfies OpenAIMessage;
      case "AI":
        return {
          role: "assistant",
          content: prompt.content
            .map((part) => phoenixMessagePartToOpenAI.parse(part))
            .filter(
              (part): part is OpenAIChatPartText =>
                part !== null && part.type === "text"
            ),
          tool_calls: prompt.content.some((part) => part.type === "tool_call")
            ? prompt.content
                .filter(
                  (part): part is ToolCallPart => part.type === "tool_call"
                )
                .map((part) => phoenixToolCallToOpenAI.parse(part))
                .filter((part): part is OpenAIToolCall => part !== null)
            : undefined,
        } satisfies OpenAIMessage;
      default:
        return assertUnreachable(role);
    }
  }
);

export const phoenixResponseFormatToOpenAI =
  phoenixResponseFormatSchema.transform(
    (phoenix): OpenAIResponseFormat => ({
      type: "json_schema",
      json_schema: {
        name: phoenix.name,
        description: phoenix.description,
        schema: jsonSchemaZodSchema.parse(phoenix.schema.json),
      },
    })
  );

export const phoenixToolCallToOpenAI = phoenixToolCallSchema.transform(
  (prompt): OpenAIToolCall => ({
    type: "function",
    id: prompt.tool_call.tool_call_id,
    function: {
      ...prompt.tool_call.tool_call,
      arguments:
        typeof prompt.tool_call.tool_call.arguments === "string"
          ? prompt.tool_call.tool_call.arguments
          : (safelyStringifyJSON(prompt.tool_call.tool_call.arguments).json ??
            ""),
    },
  })
);

export const phoenixToolDefinitionToOpenAI =
  phoenixToolDefinitionSchema.transform(
    (phoenix): OpenAIToolDefinition => ({
      type: "function",
      function: {
        name: phoenix.name,
        description: phoenix.description,
        parameters: jsonSchemaZodSchema.parse(phoenix.schema?.json),
      },
    })
  );

export const phoenixToolChoiceToOpenAI = phoenixToolChoiceSchema.transform(
  (phoenix): OpenaiToolChoice => {
    switch (phoenix.type) {
      case "none":
        return "none";
      case "zero-or-more":
        return "auto";
      case "one-or-more":
        return "required";
      case "specific-function-tool":
        return { type: "function", function: { name: phoenix.function_name } };
    }
  }
);
