from __future__ import annotations

import json
from enum import Enum
from typing import Any, Iterable, Mapping, Optional, Union, cast

import pytest
from deepdiff.diff import DeepDiff
from faker import Faker
from openai.lib._parsing import type_to_response_format_param
from openai.types.chat import (
    ChatCompletionAssistantMessageParam,
    ChatCompletionContentPartParam,
    ChatCompletionContentPartTextParam,
    ChatCompletionMessageToolCallParam,
    ChatCompletionNamedToolChoiceParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionToolParam,
    ChatCompletionUserMessageParam,
)
from openai.types.chat.chat_completion_assistant_message_param import ContentArrayOfContentPart
from openai.types.chat.chat_completion_message_tool_call_param import Function
from openai.types.chat.completion_create_params import ResponseFormat
from openai.types.shared_params import FunctionDefinition
from pydantic import BaseModel, create_model

from phoenix.client.__generated__ import v1
from phoenix.client.helpers.sdk.openai.chat import (
    _FunctionToolConversion,
    _MessageConversion,
    _ResponseFormatJSONSchemaConversion,
    _TextContentPartConversion,
    _ToolCallContentPartConversion,
    _ToolKwargs,
    _ToolKwargsConversion,
)
from phoenix.client.utils.template_formatters import NO_OP_FORMATTER

fake = Faker()


def _dict() -> dict[str, Any]:
    return fake.pydict(3, value_types=(int, float, bool, str))  # pyright: ignore[reportUnknownMemberType]


def _str() -> str:
    return fake.pystr(8, 8)


def _user_msg(
    content: Union[str, Iterable[ChatCompletionContentPartParam]],
) -> ChatCompletionUserMessageParam:
    return ChatCompletionUserMessageParam(
        role="user",
        content=content,
    )


def _assistant_msg(
    content: Optional[Union[str, Iterable[ContentArrayOfContentPart]]] = None,
    tool_calls: Iterable[ChatCompletionMessageToolCallParam] = (),
) -> ChatCompletionAssistantMessageParam:
    if not tool_calls:
        return ChatCompletionAssistantMessageParam(
            role="assistant",
            content=content,
        )
    if content is None:
        return ChatCompletionAssistantMessageParam(
            role="assistant",
            tool_calls=tool_calls,
        )
    return ChatCompletionAssistantMessageParam(
        role="assistant",
        content=content,
        tool_calls=tool_calls,
    )


def _tool_msg(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
) -> ChatCompletionToolMessageParam:
    return ChatCompletionToolMessageParam(
        role="tool",
        content=content,
        tool_call_id=_str(),
    )


def _system_msg(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
) -> ChatCompletionSystemMessageParam:
    return ChatCompletionSystemMessageParam(
        role="system",
        content=content,
    )


def _text() -> ChatCompletionContentPartTextParam:
    return ChatCompletionContentPartTextParam(
        type="text",
        text=_str(),
    )


def _tool_call() -> ChatCompletionMessageToolCallParam:
    return ChatCompletionMessageToolCallParam(
        id=_str(),
        type="function",
        function=Function(name=_str(), arguments=json.dumps(_dict())),
    )


def _tool(name: Optional[str] = None) -> ChatCompletionToolParam:
    return ChatCompletionToolParam(
        type="function",
        function=FunctionDefinition(
            name=name or _str(),
            description=_str(),
            parameters={
                "type": "object",
                "properties": {
                    "x": {"type": "int", "description": _str()},
                    "y": {"type": "string", "description": _str()},
                },
                "required": ["x", "y"],
                "additionalProperties": False,
            },
        ),
    )


class TestChatCompletionUserMessageParam:
    @pytest.mark.parametrize(
        "obj",
        [
            _user_msg(_str()),
            _user_msg([_text(), _text()]),
        ],
    )
    def test_round_trip(self, obj: ChatCompletionUserMessageParam) -> None:
        x: v1.PromptMessage = _MessageConversion.from_openai(obj)
        assert not DeepDiff(obj, next(_MessageConversion.to_openai(x, {}, NO_OP_FORMATTER)))


class TestChatCompletionSystemMessageParam:
    @pytest.mark.parametrize(
        "obj",
        [
            _system_msg(_str()),
            _system_msg([_text(), _text()]),
        ],
    )
    def test_round_trip(self, obj: ChatCompletionSystemMessageParam) -> None:
        x: v1.PromptMessage = _MessageConversion.from_openai(obj)
        assert not DeepDiff([obj], list(_MessageConversion.to_openai(x, {}, NO_OP_FORMATTER)))


class TestChatCompletionAssistantMessageParam:
    @pytest.mark.parametrize(
        "obj",
        [
            _assistant_msg(_str()),
            _assistant_msg([_text(), _text()]),
            _assistant_msg(None, [_tool_call(), _tool_call()]),
        ],
    )
    def test_round_trip(self, obj: ChatCompletionAssistantMessageParam) -> None:
        x: v1.PromptMessage = _MessageConversion.from_openai(obj)
        assert not DeepDiff([obj], list(_MessageConversion.to_openai(x, {}, NO_OP_FORMATTER)))


class TestChatCompletionToolMessageParam:
    @pytest.mark.parametrize(
        "obj",
        [
            _tool_msg(_str()),
            _tool_msg([_text(), _text()]),
        ],
    )
    def test_round_trip(self, obj: ChatCompletionToolMessageParam) -> None:
        x: v1.PromptMessage = _MessageConversion.from_openai(obj)
        assert not DeepDiff([obj], list(_MessageConversion.to_openai(x, {}, NO_OP_FORMATTER)))


class TestFunctionToolConversion:
    @pytest.mark.parametrize(
        "obj",
        [_tool()],
    )
    def test_round_trip(self, obj: ChatCompletionToolParam) -> None:
        new_obj = _FunctionToolConversion.to_openai(_FunctionToolConversion.from_openai(obj))
        assert not DeepDiff(obj, new_obj)


class TestTextContentPartConversion:
    def test_round_trip(self) -> None:
        obj: ChatCompletionContentPartTextParam = _text()
        x: v1.TextContentPart = _TextContentPartConversion.from_openai(obj)
        new_obj: ChatCompletionContentPartTextParam = _TextContentPartConversion.to_openai(
            x, {}, NO_OP_FORMATTER
        )
        assert not DeepDiff(obj, new_obj)

    def test_formatter(self) -> None:
        x = v1.TextContentPart(type="text", text=v1.TextContentValue(text=_str()))
        formatter, variables = _MockFormatter(), _dict()
        ans: ChatCompletionContentPartTextParam = _TextContentPartConversion.to_openai(
            x, variables, formatter
        )
        assert ans["text"] == formatter.format(x["text"]["text"], variables=variables)


class TestToolCallContentPartConversion:
    def test_round_trip(self) -> None:
        obj: ChatCompletionMessageToolCallParam = _tool_call()
        x: v1.ToolCallContentPart = _ToolCallContentPartConversion.from_openai(obj)
        new_obj: ChatCompletionMessageToolCallParam = _ToolCallContentPartConversion.to_openai(
            x, {}, NO_OP_FORMATTER
        )
        assert not DeepDiff(obj, new_obj)


class _UIType(str, Enum):
    div = "div"
    button = "button"
    header = "header"
    section = "section"
    field = "field"
    form = "form"


class _Attribute(BaseModel):
    name: str
    value: str


class _UI(BaseModel):
    type: _UIType
    label: str
    children: list[_UI]
    attributes: list[_Attribute]


_UI.model_rebuild()


class TestResponseFormatJSONSchemaConversion:
    @pytest.mark.parametrize(
        "type_",
        [
            create_model("Response", ui=(_UI, ...)),
        ],
    )
    def test_round_trip(self, type_: type[BaseModel]) -> None:
        obj = cast(ResponseFormat, type_to_response_format_param(type_))
        x: v1.PromptResponseFormatJSONSchema = _ResponseFormatJSONSchemaConversion.from_openai(obj)
        new_obj = _ResponseFormatJSONSchemaConversion.to_openai(x)
        assert not DeepDiff(obj, new_obj)


class TestToolKwargsConversion:
    @pytest.mark.parametrize(
        "obj",
        [
            {},
            {
                "tools": [_tool(), _tool()],
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "none",
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "none",
                "parallel_tool_calls": False,
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "auto",
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "auto",
                "parallel_tool_calls": False,
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "required",
            },
            {
                "tools": [_tool(), _tool()],
                "tool_choice": "required",
                "parallel_tool_calls": False,
            },
            {
                "tools": [_tool(), _tool("xyz")],
                "tool_choice": ChatCompletionNamedToolChoiceParam(
                    type="function",
                    function={"name": "xyz"},
                ),
            },
            {
                "tools": [_tool(), _tool("xyz")],
                "tool_choice": ChatCompletionNamedToolChoiceParam(
                    type="function",
                    function={"name": "xyz"},
                ),
                "parallel_tool_calls": False,
            },
        ],
    )
    def test_round_trip(self, obj: _ToolKwargs) -> None:
        x: Optional[v1.PromptTools] = _ToolKwargsConversion.from_openai(obj)
        new_obj: _ToolKwargs = _ToolKwargsConversion.to_openai(x)
        assert not DeepDiff(obj, new_obj)


class _MockFormatter:
    def format(self, _: str, /, *, variables: Mapping[str, str]) -> str:
        return json.dumps(variables)
