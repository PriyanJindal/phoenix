from __future__ import annotations

from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, RootModel
from typing_extensions import Annotated, TypeAlias, assert_never

from phoenix.server.api.helpers.jsonschema import (
    JSONSchemaDraft7ObjectSchema,
    JSONSchemaObjectSchema,
)

JSONSerializable = Union[None, bool, int, float, str, dict[str, Any], list[Any]]


class Undefined:
    """
    A singleton class that represents an unset or undefined value. Needed since Pydantic
    can't natively distinguish between an undefined value and a value that is set to
    None.
    """

    def __new__(cls) -> Any:
        if not hasattr(cls, "_instance"):
            cls._instance = super().__new__(cls)
        return cls._instance


UNDEFINED: Any = Undefined()


class PromptTemplateType(str, Enum):
    STRING = "STR"
    CHAT = "CHAT"


class PromptMessageRole(str, Enum):
    USER = "USER"
    SYSTEM = "SYSTEM"  # e.g. the OpenAI developer role or an Anthropic system instruction
    AI = "AI"  # E.g. the assistant. Normalize to AI for consistency.
    TOOL = "TOOL"


class PromptTemplateFormat(str, Enum):
    MUSTACHE = "MUSTACHE"
    FSTRING = "FSTRING"
    NONE = "NONE"


class PromptModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",  # disallow extra attributes
        use_enum_values=True,
    )

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        kwargs = {k: v for k, v in kwargs.items() if v is not UNDEFINED}
        super().__init__(*args, **kwargs)

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        return super().model_dump(*args, exclude_unset=True, by_alias=True, **kwargs)


class TextContentValue(BaseModel):
    text: str


class TextContentPart(PromptModel):
    type: Literal["text"]
    text: TextContentValue


class ImageContentValue(BaseModel):
    # http url, or base64 encoded image
    url: str
    # detail: Optional[Literal["auto", "low", "high"]]


class ImageContentPart(PromptModel):
    type: Literal["image"]
    # the image data
    image: ImageContentValue


class ToolCallFunction(BaseModel):
    type: Literal["function"]
    name: str
    arguments: str


class ToolCallContentValue(BaseModel):
    tool_call_id: str
    tool_call: ToolCallFunction


class ToolCallContentPart(PromptModel):
    type: Literal["tool_call"]
    # the identifier of the tool call function
    tool_call: ToolCallContentValue


class ToolResultContentValue(BaseModel):
    tool_call_id: str
    result: JSONSerializable


class ToolResultContentPart(PromptModel):
    type: Literal["tool_result"]
    tool_result: ToolResultContentValue


ContentPart: TypeAlias = Annotated[
    Union[TextContentPart, ImageContentPart, ToolCallContentPart, ToolResultContentPart],
    Field(..., discriminator="type"),
]


class PromptMessage(PromptModel):
    role: PromptMessageRole
    content: list[ContentPart]


class PromptChatTemplateV1(PromptModel):
    version: Literal["chat-template-v1"]
    messages: list[PromptMessage]


class PromptStringTemplateV1(PromptModel):
    version: Literal["string-template-v1"]
    template: str


PromptTemplate: TypeAlias = Annotated[
    Union[PromptChatTemplateV1, PromptStringTemplateV1], Field(..., discriminator="version")
]


class PromptTemplateWrapper(PromptModel):
    """
    Discriminated union types don't have pydantic methods such as
    `model_validate`, so a wrapper around the union type is needed.
    """

    template: PromptTemplate


class PromptFunctionToolV1(PromptModel):
    type: Literal["function-tool-v1"]
    name: str
    description: str = UNDEFINED
    schema_: JSONSchemaObjectSchema = Field(
        default=UNDEFINED,
        alias="schema",  # avoid conflict with pydantic schema class method
    )
    extra_parameters: dict[str, Any] = UNDEFINED


PromptTool: TypeAlias = Annotated[Union[PromptFunctionToolV1], Field(..., discriminator="type")]


class PromptToolsV1(PromptModel):
    type: Literal["tools-v1"]
    tools: Annotated[list[PromptTool], Field(..., min_length=1)]
    tool_choice: PromptToolChoice = UNDEFINED
    disable_parallel_tool_calls: bool = UNDEFINED


class PromptToolChoiceNone(PromptModel):
    type: Literal["none"]


class PromptToolChoiceZeroOrMore(PromptModel):
    type: Literal["zero-or-more"]


class PromptToolChoiceOneOrMore(PromptModel):
    type: Literal["one-or-more"]


class PromptToolChoiceSpecificFunctionTool(PromptModel):
    type: Literal["specific-function-tool"]
    function_name: str


PromptToolChoice: TypeAlias = Annotated[
    Union[
        PromptToolChoiceNone,
        PromptToolChoiceZeroOrMore,
        PromptToolChoiceOneOrMore,
        PromptToolChoiceSpecificFunctionTool,
    ],
    Field(..., discriminator="type"),
]


class PromptOpenAIJSONSchema(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/d16e6edde5a155626910b5758a0b939bfedb9ced/src/openai/types/shared/response_format_json_schema.py#L13
    """

    name: str
    description: str = UNDEFINED
    schema_: dict[str, Any] = Field(
        ...,
        alias="schema",  # an alias is used to avoid conflict with the pydantic schema class method
    )
    strict: Optional[bool] = UNDEFINED


class PromptOpenAIResponseFormatJSONSchema(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/d16e6edde5a155626910b5758a0b939bfedb9ced/src/openai/types/shared/response_format_json_schema.py#L40
    """

    json_schema: PromptOpenAIJSONSchema
    type: Literal["json_schema"]


class PromptResponseFormatJSONSchema(PromptModel):
    type: Literal["response-format-json-schema-v1"]
    name: str
    description: str = UNDEFINED
    schema_: JSONSchemaObjectSchema = Field(
        ...,
        alias="schema",  # an alias is used to avoid conflict with the pydantic schema class method
    )
    extra_parameters: dict[str, Any]


PromptResponseFormat: TypeAlias = Annotated[
    Union[PromptResponseFormatJSONSchema], Field(..., discriminator="type")
]


class PromptResponseFormatWrapper(PromptModel):
    """
    Discriminated union types don't have pydantic methods such as
    `model_validate`, so a wrapper around the union type is needed.
    """

    schema_: Annotated[
        Union[PromptResponseFormat],
        Field(
            ...,
            discriminator="type",
            alias="schema",  # avoid conflict with the pydantic schema class method
        ),
    ]


def _openai_to_prompt_response_format(
    schema: PromptOpenAIResponseFormatJSONSchema,
) -> PromptResponseFormat:
    json_schema = schema.json_schema
    extra_parameters = {}
    if (strict := json_schema.strict) is not UNDEFINED:
        extra_parameters["strict"] = strict
    return PromptResponseFormatJSONSchema(
        type="response-format-json-schema-v1",
        name=json_schema.name,
        description=json_schema.description,
        schema=JSONSchemaDraft7ObjectSchema(
            type="json-schema-draft-7-object-schema",
            json=json_schema.schema_,
        ),
        extra_parameters=extra_parameters,
    )


def _prompt_to_openai_response_format(
    response_format: PromptResponseFormat,
) -> PromptOpenAIResponseFormatJSONSchema:
    assert isinstance(response_format, PromptResponseFormatJSONSchema)
    name = response_format.name
    description = response_format.description
    schema = response_format.schema_
    extra_parameters = response_format.extra_parameters
    strict = extra_parameters.get("strict", UNDEFINED)
    return PromptOpenAIResponseFormatJSONSchema(
        type="json_schema",
        json_schema=PromptOpenAIJSONSchema(
            name=name,
            description=description,
            schema=schema.json_,
            strict=strict,
        ),
    )


def normalize_response_format(
    response_format: dict[str, Any], model_provider: str
) -> PromptResponseFormat:
    if model_provider.lower() == "openai":
        openai_response_format = PromptOpenAIResponseFormatJSONSchema.model_validate(
            response_format
        )
        return _openai_to_prompt_response_format(openai_response_format)
    raise ValueError(f"Unsupported model provider: {model_provider}")


def denormalize_response_format(
    response_format: PromptResponseFormat, model_provider: str
) -> dict[str, Any]:
    if model_provider.lower() == "openai":
        openai_response_format = _prompt_to_openai_response_format(response_format)
        return openai_response_format.model_dump()
    raise ValueError(f"Unsupported model provider: {model_provider}")


# OpenAI tool definitions
class OpenAIFunctionDefinition(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/1e07c9d839e7e96f02d0a4b745f379a43086334c/src/openai/types/shared_params/function_definition.py#L13
    """

    name: str
    description: str = UNDEFINED
    parameters: dict[str, Any] = UNDEFINED
    strict: Optional[bool] = UNDEFINED


class OpenAIToolDefinition(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/1e07c9d839e7e96f02d0a4b745f379a43086334c/src/openai/types/chat/chat_completion_tool_param.py#L12
    """

    function: OpenAIFunctionDefinition
    type: Literal["function"]


# Anthropic tool definitions
class AnthropicCacheControlParam(PromptModel):
    """
    Based on https://github.com/anthropics/anthropic-sdk-python/blob/93cbbbde964e244f02bf1bd2b579c5fabce4e267/src/anthropic/types/cache_control_ephemeral_param.py#L10
    """

    type: Literal["ephemeral"]


class AnthropicToolDefinition(PromptModel):
    """
    Based on https://github.com/anthropics/anthropic-sdk-python/blob/93cbbbde964e244f02bf1bd2b579c5fabce4e267/src/anthropic/types/tool_param.py#L22
    """

    input_schema: dict[str, Any]
    name: str
    cache_control: Optional[AnthropicCacheControlParam] = UNDEFINED
    description: str = UNDEFINED


class OpenAIToolChoiceParamFunction(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/7193688e364bd726594fe369032e813ced1bdfe2/src/openai/types/chat/chat_completion_named_tool_choice_param.py#L10
    """

    name: str


class PromptOpenAINamedToolChoiceParam(PromptModel):
    """
    Based on https://github.com/openai/openai-python/blob/7193688e364bd726594fe369032e813ced1bdfe2/src/openai/types/chat/chat_completion_named_tool_choice_param.py#L15
    """

    type: Literal["function"]
    function: OpenAIToolChoiceParamFunction


PromptOpenAIToolChoiceType: TypeAlias = Union[
    Literal["none", "auto", "required"], PromptOpenAINamedToolChoiceParam
]


class PromptOpenAIToolChoice(RootModel[PromptOpenAIToolChoiceType]):
    """
    Based on https://github.com/openai/openai-python/blob/7193688e364bd726594fe369032e813ced1bdfe2/src/openai/types/chat/chat_completion_tool_choice_option_param.py#L12
    """

    root: PromptOpenAIToolChoiceType


class PromptOpenAIInvocationParameters(PromptModel):
    temperature: float = UNDEFINED
    max_tokens: int = UNDEFINED
    frequency_penalty: float = UNDEFINED
    presence_penalty: float = UNDEFINED
    top_p: float = UNDEFINED
    seed: int = UNDEFINED
    reasoning_effort: Literal["low", "medium", "high"] = UNDEFINED
    tool_choice: PromptOpenAIToolChoice = UNDEFINED


# Anthropic tool choice
class PromptAnthropicToolChoiceAutoParam(PromptModel):
    """
    Based on https://github.com/anthropics/anthropic-sdk-python/blob/0f9ccca8e26cf27b969e38c02899fde4b3489c86/src/anthropic/types/tool_choice_auto_param.py#L10
    """

    type: Literal["auto"]


class PromptAnthropicToolChoiceAnyParam(PromptModel):
    """
    Based on https://github.com/anthropics/anthropic-sdk-python/blob/0f9ccca8e26cf27b969e38c02899fde4b3489c86/src/anthropic/types/tool_choice_any_param.py#L10
    """

    type: Literal["any"]


class PromptAnthropicToolChoiceToolParam(PromptModel):
    """
    Based on https://github.com/anthropics/anthropic-sdk-python/blob/0f9ccca8e26cf27b969e38c02899fde4b3489c86/src/anthropic/types/tool_choice_any_param.py#L10
    """

    name: str
    type: Literal["tool"]


PromptAnthropicToolChoiceType: TypeAlias = Union[
    PromptAnthropicToolChoiceAutoParam,
    PromptAnthropicToolChoiceAnyParam,
    PromptAnthropicToolChoiceToolParam,
]  # Based on https://github.com/anthropics/anthropic-sdk-python/blob/0f9ccca8e26cf27b969e38c02899fde4b3489c86/src/anthropic/types/tool_choice_param.py#L14


class PromptAnthropicToolChoice(RootModel[PromptAnthropicToolChoiceType]):
    root: PromptAnthropicToolChoiceType


class PromptAnthropicInvocationParameters(PromptModel):
    temperature: float = UNDEFINED
    max_tokens: int = UNDEFINED
    top_p: float = UNDEFINED
    stop_sequences: list[str] = UNDEFINED
    tool_choice: PromptAnthropicToolChoice = UNDEFINED


class PromptGeminiInvocationParameters(PromptModel):
    temperature: float = UNDEFINED
    max_output_tokens: int = UNDEFINED
    tool_choice: str = UNDEFINED
    stop_sequences: list[str] = UNDEFINED
    presence_penalty: float = UNDEFINED
    frequency_penalty: float = UNDEFINED
    top_p: float = UNDEFINED
    top_k: int = UNDEFINED


class PromptInvocationParams(PromptModel):
    temperature: float = UNDEFINED
    max_completion_tokens: int = UNDEFINED
    frequency_penalty: float = UNDEFINED
    presence_penalty: float = UNDEFINED
    top_p: float = UNDEFINED
    random_seed: int = UNDEFINED
    stop_sequences: list[str] = UNDEFINED
    extra_parameters: dict[str, Any]
    top_k: int = UNDEFINED


class PromptInvocationParameters(PromptModel):
    type: Literal["invocation-parameters"]
    parameters: PromptInvocationParams


def normalize_invocation_parameters(
    parameters: dict[str, Any], model_provider: str
) -> PromptInvocationParameters:
    extra_parameters: dict[str, Any] = {}
    if model_provider.lower() == "openai":
        openai_invocation_parameters = PromptOpenAIInvocationParameters.model_validate(parameters)
        if (openai_tool_choice := openai_invocation_parameters.tool_choice) is not UNDEFINED:
            extra_parameters["tool_choice"] = openai_tool_choice
        if (reasoning_effort := openai_invocation_parameters.reasoning_effort) is not UNDEFINED:
            extra_parameters["reasoning_effort"] = reasoning_effort
        return PromptInvocationParameters(
            type="invocation-parameters",
            parameters=PromptInvocationParams(
                temperature=openai_invocation_parameters.temperature,
                max_completion_tokens=openai_invocation_parameters.max_tokens,
                frequency_penalty=openai_invocation_parameters.frequency_penalty,
                presence_penalty=openai_invocation_parameters.presence_penalty,
                top_p=openai_invocation_parameters.top_p,
                random_seed=openai_invocation_parameters.seed,
                extra_parameters=extra_parameters,
            ),
        )
    if model_provider.lower() == "anthropic":
        anthropic_invocation_parameters = PromptAnthropicInvocationParameters.model_validate(
            parameters
        )
        if (anthropic_tool_choice := anthropic_invocation_parameters.tool_choice) is not UNDEFINED:
            extra_parameters["tool_choice"] = anthropic_tool_choice
        return PromptInvocationParameters(
            type="invocation-parameters",
            parameters=PromptInvocationParams(
                temperature=anthropic_invocation_parameters.temperature,
                max_completion_tokens=anthropic_invocation_parameters.max_tokens,
                top_p=anthropic_invocation_parameters.top_p,
                stop_sequences=anthropic_invocation_parameters.stop_sequences,
                extra_parameters=extra_parameters,
            ),
        )
    if model_provider.lower() == "gemini":
        gemini_invocation_parameters = PromptGeminiInvocationParameters.model_validate(parameters)
        if (gemini_tool_choice := gemini_invocation_parameters.tool_choice) is not UNDEFINED:
            extra_parameters["tool_choice"] = gemini_tool_choice
        return PromptInvocationParameters(
            type="invocation-parameters",
            parameters=PromptInvocationParams(
                temperature=gemini_invocation_parameters.temperature,
                max_completion_tokens=gemini_invocation_parameters.max_output_tokens,
                stop_sequences=gemini_invocation_parameters.stop_sequences,
                presence_penalty=gemini_invocation_parameters.presence_penalty,
                frequency_penalty=gemini_invocation_parameters.frequency_penalty,
                top_p=gemini_invocation_parameters.top_p,
                top_k=gemini_invocation_parameters.top_k,
                extra_parameters=extra_parameters,
            ),
        )
    raise ValueError(f"Unsupported model provider: {model_provider}")


def denormalize_invocation_parameters(
    parameters: PromptInvocationParameters, model_provider: str
) -> dict[str, Any]:
    params = parameters.parameters
    if model_provider.lower() == "openai":
        openai_invocation_parameters = PromptOpenAIInvocationParameters(
            temperature=params.temperature,
            max_tokens=params.max_completion_tokens,
            frequency_penalty=params.frequency_penalty,
            presence_penalty=params.presence_penalty,
            top_p=params.top_p,
            seed=params.random_seed,
            tool_choice=params.extra_parameters.get("tool_choice", UNDEFINED),
            reasoning_effort=params.extra_parameters.get("reasoning_effort", UNDEFINED),
        )
        return openai_invocation_parameters.model_dump()
    if model_provider.lower() == "anthropic":
        anthropic_invocation_parameters = PromptAnthropicInvocationParameters(
            max_tokens=params.max_completion_tokens,
            temperature=params.temperature,
            stop_sequences=params.stop_sequences,
            top_p=params.top_p,
            tool_choice=params.extra_parameters.get("tool_choice", UNDEFINED),
        )
        return anthropic_invocation_parameters.model_dump()
    if model_provider.lower() == "gemini":
        gemini_invocation_parameters = PromptGeminiInvocationParameters(
            temperature=params.temperature,
            max_output_tokens=params.max_completion_tokens,
            stop_sequences=params.stop_sequences,
            presence_penalty=params.presence_penalty,
            frequency_penalty=params.frequency_penalty,
            top_p=params.top_p,
            top_k=params.top_k,
            tool_choice=params.extra_parameters.get("tool_choice", UNDEFINED),
        )
        return gemini_invocation_parameters.model_dump()
    return {}


def _normalize_tool_choice(tool_choice: Any, model_provider: str) -> PromptToolChoice:
    assert tool_choice is not UNDEFINED
    if model_provider.lower() == "openai":
        return _openai_to_prompt_tool_choice(tool_choice)
    if model_provider.lower() == "anthropic":
        return _anthropic_to_prompt_tool_choice(tool_choice)
    raise ValueError(f"Model provider does not support tool choice: {model_provider}")


def _denormalize_tool_choice(tool_choice: PromptToolChoice, model_provider: str) -> Any:
    if model_provider.lower() == "openai":
        return _prompt_to_openai_tool_choice(tool_choice)
    if model_provider.lower() == "anthropic":
        return _prompt_to_anthropic_tool_choice(tool_choice)
    raise ValueError(f"Model provider does not support tool choice: {model_provider}")


def _normalize_tool(schema: dict[str, Any], model_provider: str) -> PromptTool:
    if model_provider.lower() == "openai":
        openai_tool = OpenAIToolDefinition.model_validate(schema)
        return _openai_to_prompt_tool(openai_tool)
    elif model_provider.lower() == "anthropic":
        anthropic_tool = AnthropicToolDefinition.model_validate(schema)
        return _anthropic_to_prompt_tool(anthropic_tool)
    raise ValueError(f"Model provider does not support tool schema: {model_provider}")


def normalize_tools(
    schemas: list[dict[str, Any]], model_provider: str, tool_choice: Any = None
) -> PromptToolsV1:
    tools: list[PromptTool]
    if model_provider.lower() == "openai":
        tools = [_normalize_tool(schema, model_provider) for schema in schemas]
    elif model_provider.lower() == "anthropic":
        tools = [_normalize_tool(schema, model_provider) for schema in schemas]
    else:
        raise ValueError(f"Model provider does not support tools: {model_provider}")
    normalized_tool_choice = (
        _normalize_tool_choice(tool_choice, model_provider)
        if tool_choice is not None
        else UNDEFINED
    )
    return PromptToolsV1(type="tools-v1", tools=tools, tool_choice=normalized_tool_choice)


def denormalize_tools(
    tools: PromptToolsV1, model_provider: str
) -> tuple[list[dict[str, Any]], Any]:
    assert tools.type == "tools-v1"
    denormalized_tools: list[PromptModel]
    if model_provider.lower() == "openai":
        denormalized_tools = [_prompt_to_openai_tool(tool) for tool in tools.tools]
    elif model_provider.lower() == "anthropic":
        denormalized_tools = [_prompt_to_anthropic_tool(tool) for tool in tools.tools]
    else:
        raise ValueError(f"Model provider does not support tools: {model_provider}")
    return [tool.model_dump() for tool in denormalized_tools], _denormalize_tool_choice(
        tools.tool_choice, model_provider
    ) if tools.tool_choice is not UNDEFINED else None


def _openai_to_prompt_tool(
    tool: OpenAIToolDefinition,
) -> PromptFunctionToolV1:
    function_definition = tool.function
    name = function_definition.name
    description = function_definition.description
    extra_parameters = {}
    if (strict := function_definition.strict) is not UNDEFINED:
        extra_parameters["strict"] = strict
    return PromptFunctionToolV1(
        type="function-tool-v1",
        name=name,
        description=description,
        schema=JSONSchemaDraft7ObjectSchema(
            type="json-schema-draft-7-object-schema",
            json=schema_content,
        )
        if (schema_content := function_definition.parameters) is not UNDEFINED
        else UNDEFINED,
        extra_parameters=extra_parameters,
    )


def _openai_to_prompt_tool_choice(tool_choice: Optional[Any]) -> PromptToolChoice:
    openai_tool_choice = PromptOpenAIToolChoice.model_validate(tool_choice).root
    if openai_tool_choice == "none":
        return PromptToolChoiceNone(type="none")
    elif openai_tool_choice == "auto":
        return PromptToolChoiceZeroOrMore(type="zero-or-more")
    elif openai_tool_choice == "required":
        return PromptToolChoiceOneOrMore(type="one-or-more")
    elif isinstance(openai_tool_choice, PromptOpenAINamedToolChoiceParam):
        return PromptToolChoiceSpecificFunctionTool(
            type="specific-function-tool",
            function_name=openai_tool_choice.function.name,
        )
    assert_never(openai_tool_choice)


def _prompt_to_openai_tool_choice(tool_choice: PromptToolChoice) -> Any:
    if isinstance(tool_choice, PromptToolChoiceNone):
        return "none"
    if isinstance(tool_choice, PromptToolChoiceZeroOrMore):
        return "auto"
    if isinstance(tool_choice, PromptToolChoiceOneOrMore):
        return "required"
    if isinstance(tool_choice, PromptToolChoiceSpecificFunctionTool):
        return PromptOpenAINamedToolChoiceParam(
            type="function",
            function=OpenAIToolChoiceParamFunction(name=tool_choice.function_name),
        ).model_dump()
    assert_never(tool_choice)


def _anthropic_to_prompt_tool_choice(tool_choice: Optional[Any]) -> PromptToolChoice:
    anthropic_tool_choice = PromptAnthropicToolChoice.model_validate(tool_choice).root
    if isinstance(anthropic_tool_choice, PromptAnthropicToolChoiceAutoParam):
        return PromptToolChoiceZeroOrMore(type="auto")
    if isinstance(anthropic_tool_choice, PromptAnthropicToolChoiceAnyParam):
        return PromptToolChoiceOneOrMore(type="any")
    if isinstance(anthropic_tool_choice, PromptAnthropicToolChoiceToolParam):
        return PromptToolChoiceSpecificFunctionTool(
            type="specific-function-tool",
            function_name=anthropic_tool_choice.name,
        )
    assert_never(anthropic_tool_choice)


def _prompt_to_anthropic_tool_choice(tool_choice: PromptToolChoice) -> Any:
    anthropic_tool_choice: PromptAnthropicToolChoiceType
    if isinstance(tool_choice, PromptToolChoiceNone):
        anthropic_tool_choice = PromptAnthropicToolChoiceAutoParam(type="auto")
    elif isinstance(tool_choice, PromptToolChoiceZeroOrMore):
        anthropic_tool_choice = PromptAnthropicToolChoiceAnyParam(type="any")
    elif isinstance(tool_choice, PromptToolChoiceOneOrMore):
        anthropic_tool_choice = PromptAnthropicToolChoiceToolParam(
            type="tool",
            name=tool_choice.function.name,
        )
    else:
        assert_never(tool_choice)
    return anthropic_tool_choice.model_dump()


def _prompt_to_openai_tool(
    tool: PromptFunctionToolV1,
) -> OpenAIToolDefinition:
    return OpenAIToolDefinition(
        type="function",
        function=OpenAIFunctionDefinition(
            name=tool.name,
            description=tool.description,
            parameters=schema.json_ if (schema := tool.schema_) is not UNDEFINED else UNDEFINED,
            strict=tool.extra_parameters.get("strict", UNDEFINED),
        ),
    )


def _anthropic_to_prompt_tool(
    tool: AnthropicToolDefinition,
) -> PromptFunctionToolV1:
    extra_parameters: dict[str, Any] = {}
    if (cache_control := tool.cache_control) is not UNDEFINED:
        if cache_control is None:
            extra_parameters["cache_control"] = None
        elif isinstance(cache_control, AnthropicCacheControlParam):
            extra_parameters["cache_control"] = cache_control.model_dump()
        else:
            assert_never(cache_control)
    return PromptFunctionToolV1(
        type="function-tool-v1",
        name=tool.name,
        description=tool.description,
        schema=JSONSchemaDraft7ObjectSchema(
            type="json-schema-draft-7-object-schema",
            json=tool.input_schema,
        ),
        extra_parameters=extra_parameters,
    )


def _prompt_to_anthropic_tool(
    tool: PromptFunctionToolV1,
) -> AnthropicToolDefinition:
    cache_control = tool.extra_parameters.get("cache_control", UNDEFINED)
    anthropic_cache_control: Optional[AnthropicCacheControlParam]
    if cache_control is UNDEFINED:
        anthropic_cache_control = UNDEFINED
    elif cache_control is None:
        anthropic_cache_control = None
    else:
        anthropic_cache_control = AnthropicCacheControlParam.model_validate(cache_control)
    return AnthropicToolDefinition(
        input_schema=tool.schema_.json_,
        name=tool.name,
        description=tool.description,
        cache_control=anthropic_cache_control,
    )
