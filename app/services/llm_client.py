"""Thin wrapper around the Anthropic Claude API.

Exposes a single ``call_llm(prompt, temperature)`` function used by the
Extraction and Decision agents. Model is configurable via ``ANTHROPIC_MODEL_ID``.
"""

from __future__ import annotations

import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL_ID = "claude-sonnet-4-6"
DEFAULT_MAX_TOKENS = 3000


def _required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"Environment variable {name} is not set. "
            f"Copy .env.example to .env and fill in your Anthropic credentials."
        )
    return value


def call_llm(prompt: str, temperature: float = 0.1) -> str:
    """Send a prompt to Claude and return the model's text response."""
    model_id = os.environ.get("ANTHROPIC_MODEL_ID", DEFAULT_MODEL_ID)
    client = anthropic.Anthropic(api_key=_required_env("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model=model_id,
        max_tokens=DEFAULT_MAX_TOKENS,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
