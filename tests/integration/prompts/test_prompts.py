from __future__ import annotations

import json
from enum import Enum
from secrets import token_hex
from types import MappingProxyType
from typing import Any, Iterable, Literal, Mapping, Sequence, cast

import phoenix as px
import pytest
from anthropic.types import (
    ToolChoiceAnyParam,
    ToolChoiceAutoParam,
    ToolChoiceParam,
    ToolChoiceToolParam,
    ToolParam,
)
from deepdiff.diff import DeepDiff
from openai import pydantic_function_tool
from openai.lib._parsing import type_to_response_format_param
from openai.types.chat import (
    ChatCompletionNamedToolChoiceParam,
    ChatCompletionToolChoiceOptionParam,
    ChatCompletionToolParam,
)
from openai.types.shared_params import ResponseFormatJSONSchema
from phoenix.client.types import PromptVersion
from pydantic import BaseModel, create_model

from ...__generated__.graphql import (
    ChatPromptVersionInput,
    ContentPartInput,
    CreateChatPromptInput,
    PromptChatTemplateInput,
    PromptMessageInput,
    ResponseFormatInput,
    TextContentValueInput,
    ToolDefinitionInput,
)
from .._helpers import _MEMBER, _GetUser, _LoggedInUser


class TestUserMessage:
    def test_user_message(
        self,
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user(_MEMBER).log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        x = token_hex(4)
        expected = [{"role": "user", "content": f"hello {x}"}]
        prompt = _create_chat_prompt(u, template_format="FSTRING")
        messages = prompt.format(variables={"x": x}).messages
        assert not DeepDiff(expected, messages)
        _can_recreate_under_new_identifier(prompt)


class _GetWeather(BaseModel):
    city: str
    country: str


class _GetPopulation(BaseModel):
    country: str
    year: int


class TestTools:
    @pytest.mark.parametrize(
        "types_",
        [
            [_GetWeather],
        ],
    )
    def test_openai(
        self,
        types_: Sequence[type[BaseModel]],
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user(_MEMBER).log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        expected: Mapping[str, ChatCompletionToolParam] = {
            t.__name__: cast(
                ChatCompletionToolParam, json.loads(json.dumps(pydantic_function_tool(t)))
            )
            for t in types_
        }
        tools = [ToolDefinitionInput(definition=dict(v)) for v in expected.values()]
        prompt = _create_chat_prompt(u, tools=tools)
        kwargs = prompt.format().kwargs
        assert "tools" in kwargs
        actual: dict[str, ChatCompletionToolParam] = {
            t["function"]["name"]: t
            for t in cast(Iterable[ChatCompletionToolParam], kwargs["tools"])
            if t["type"] == "function" and "parameters" in t["function"]
        }
        assert not DeepDiff(expected, actual)
        _can_recreate_under_new_identifier(prompt)

    @pytest.mark.parametrize(
        "types_",
        [
            [_GetWeather],
        ],
    )
    def test_anthropic(
        self,
        types_: Sequence[type[BaseModel]],
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user().log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        expected: dict[str, ToolParam] = {
            t.__name__: ToolParam(
                name=t.__name__,
                input_schema=t.model_json_schema(),
            )
            for t in types_
        }
        tools = [ToolDefinitionInput(definition=dict(v)) for v in expected.values()]
        prompt = _create_chat_prompt(
            u,
            tools=tools,
            model_provider="ANTHROPIC",
            invocation_parameters={"max_tokens": 1024},
        )
        kwargs = prompt.format().kwargs
        assert "tools" in kwargs
        actual = {t["name"]: t for t in cast(Iterable[ToolParam], kwargs["tools"])}
        assert not DeepDiff(expected, actual)
        assert "max_tokens" in kwargs
        assert kwargs["max_tokens"] == 1024
        _can_recreate_under_new_identifier(prompt)


class TestToolChoice:
    @pytest.mark.parametrize(
        "expected",
        [
            "none",
            "auto",
            "required",
            ChatCompletionNamedToolChoiceParam(type="function", function={"name": "_GetWeather"}),
        ],
    )
    def test_openai(
        self,
        expected: ChatCompletionToolChoiceOptionParam,
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user(_MEMBER).log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        tools = [
            ToolDefinitionInput(definition=json.loads(json.dumps(pydantic_function_tool(t))))
            for t in cast(Iterable[type[BaseModel]], [_GetWeather, _GetPopulation])
        ]
        invocation_parameters = {"tool_choice": expected}
        prompt = _create_chat_prompt(u, tools=tools, invocation_parameters=invocation_parameters)
        kwargs = prompt.format().kwargs
        assert "tool_choice" in kwargs
        actual = kwargs["tool_choice"]
        assert not DeepDiff(expected, actual)
        _can_recreate_under_new_identifier(prompt)

    @pytest.mark.parametrize(
        "expected",
        [
            ToolChoiceAutoParam(type="auto"),
            ToolChoiceAnyParam(type="any"),
            ToolChoiceToolParam(type="tool", name="_GetWeather"),
        ],
    )
    def test_anthropic(
        self,
        expected: ToolChoiceParam,
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user(_MEMBER).log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        tools = [
            ToolDefinitionInput(
                definition=dict(ToolParam(name=t.__name__, input_schema=t.model_json_schema()))
            )
            for t in cast(Iterable[type[BaseModel]], [_GetWeather, _GetPopulation])
        ]
        invocation_parameters = {"max_tokens": 1024, "tool_choice": expected}
        prompt = _create_chat_prompt(
            u,
            tools=tools,
            invocation_parameters=invocation_parameters,
            model_provider="ANTHROPIC",
        )
        kwargs = prompt.format().kwargs
        assert "tool_choice" in kwargs
        actual = kwargs["tool_choice"]
        assert not DeepDiff(expected, actual)
        assert "max_tokens" in kwargs
        assert kwargs["max_tokens"] == 1024
        _can_recreate_under_new_identifier(prompt)


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


class TestResponseFormat:
    @pytest.mark.parametrize(
        "type_",
        [
            create_model("Response", ui=(_UI, ...)),
        ],
    )
    def test_openai(
        self,
        type_: type[BaseModel],
        _get_user: _GetUser,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        u = _get_user(_MEMBER).log_in()
        monkeypatch.setenv("PHOENIX_API_KEY", u.create_api_key())
        expected = cast(ResponseFormatJSONSchema, type_to_response_format_param(type_))
        response_format = ResponseFormatInput(definition=dict(expected))
        prompt = _create_chat_prompt(u, response_format=response_format)
        kwargs = prompt.format().kwargs
        assert "response_format" in kwargs
        actual = kwargs["response_format"]
        assert not DeepDiff(expected, actual)
        _can_recreate_under_new_identifier(prompt)


def _can_recreate_under_new_identifier(version: PromptVersion) -> None:
    new_name = token_hex(8)
    a = px.Client().prompts.create(name=new_name, version=version)
    assert version.id != a.id
    expected = version.dumps()
    assert not DeepDiff(expected, a.dumps())
    b = px.Client().prompts.get(prompt_identifier=new_name)
    assert a.id == b.id
    assert not DeepDiff(expected, b.dumps())
    same_name = new_name
    c = px.Client().prompts.create(name=same_name, version=version)
    assert a.id != c.id
    assert not DeepDiff(expected, c.dumps())


def _create_chat_prompt(
    u: _LoggedInUser,
    /,
    *,
    messages: Sequence[PromptMessageInput] = (),
    model_provider: Literal["ANTHROPIC", "AZURE_OPENAI", "GEMINI", "OPENAI"] = "OPENAI",
    model_name: str | None = None,
    response_format: ResponseFormatInput | None = None,
    tools: Sequence[ToolDefinitionInput] = (),
    invocation_parameters: Mapping[str, Any] = MappingProxyType({}),
    template_format: Literal["FSTRING", "MUSTACHE", "NONE"] = "NONE",
) -> PromptVersion:
    messages = list(messages) or [
        PromptMessageInput(
            role="USER",
            content=[ContentPartInput(text=TextContentValueInput(text="hello {x}"))],
        )
    ]
    version = ChatPromptVersionInput(
        templateFormat=template_format,
        template=PromptChatTemplateInput(messages=messages),
        invocationParameters=dict(invocation_parameters),
        modelProvider=model_provider,
        modelName=model_name or token_hex(16),
        tools=list(tools),
        responseFormat=response_format,
    )
    variables = {
        "input": CreateChatPromptInput(
            name=token_hex(16),
            promptVersion=version,
        ).model_dump(exclude_unset=True)
    }
    response, _ = u.gql(query=_CREATE_CHAT_PROMPT, variables=variables)
    prompt_id = response["data"]["createChatPrompt"]["id"]
    return px.Client().prompts.get(prompt_identifier=prompt_id)


_CREATE_CHAT_PROMPT = """
    mutation ($input: CreateChatPromptInput!) {
        createChatPrompt(input: $input) {
            id
        }
    }
"""
