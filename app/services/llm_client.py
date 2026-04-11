"""Thin wrapper around IBM Watsonx.ai foundation models.

Exposes a single ``call_llm(prompt, temperature)`` function used by the
Extraction and Decision agents. The model ID is configurable via
``WATSONX_MODEL_ID`` so the team can switch Granite versions without code
changes — model availability on Watsonx varies by region and project.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

load_dotenv()

DEFAULT_MODEL_ID = "ibm/granite-3-8b-instruct"
DEFAULT_MAX_NEW_TOKENS = 3000


def _required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"Environment variable {name} is not set. "
            f"Copy .env.example to .env and fill in your Watsonx credentials."
        )
    return value


def get_model(
    temperature: float = 0.1,
    max_new_tokens: int = DEFAULT_MAX_NEW_TOKENS,
) -> ModelInference:
    """Construct a Watsonx ``ModelInference`` client with sensible defaults."""
    model_id = os.environ.get("WATSONX_MODEL_ID", DEFAULT_MODEL_ID)
    credentials = Credentials(
        api_key=_required_env("WATSONX_API_KEY"),
        url=_required_env("WATSONX_URL"),
    )
    return ModelInference(
        model_id=model_id,
        credentials=credentials,
        project_id=_required_env("WATSONX_PROJECT_ID"),
        params={
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "repetition_penalty": 1.05,
        },
    )


def call_llm(prompt: str, temperature: float = 0.1) -> str:
    """Send a prompt to Watsonx and return the model's text response."""
    model = get_model(temperature=temperature)
    return model.generate_text(prompt=prompt)
