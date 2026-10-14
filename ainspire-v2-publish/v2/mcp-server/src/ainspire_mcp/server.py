from __future__ import annotations

import argparse
import json

from fastmcp import FastMCP

from .catalog import Dimension, Language, Persona, get_learning_catalog, get_learning_path as build_learning_path
from .youtube import get_learning_videos

mcp = FastMCP(
    "AiNspire Learning",
    instructions=(
        "Provides governed EN/BM learning paths and YouTube learning resources. "
        "Use only persona and capability dimensions; do not send employee names, "
        "assessment answers, or other identifying information. Video lessons are in English."
    ),
)


@mcp.tool
def get_learning_path(persona: Persona, language: Language = "EN") -> list[dict[str, str]]:
    """Get the three governed learning topics for an AiNspire persona."""
    return build_learning_path(persona, language)


@mcp.tool
async def search_learning_videos(
    persona: Persona,
    weakest_dimensions: list[Dimension],
    language: Language = "EN",
) -> list[dict[str, str]]:
    """Find up to two relevant YouTube lessons, with curated fallback results."""
    return await get_learning_videos(persona, language, weakest_dimensions)


@mcp.resource("learning://catalog/{language}")
def learning_catalog(language: str) -> str:
    """Read the governed learning-topic catalogue for EN or BM."""
    normalized = language.upper()
    if normalized not in ("EN", "BM"):
        raise ValueError("language must be EN or BM")
    return json.dumps(get_learning_catalog(normalized), ensure_ascii=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the AiNspire Learning FastMCP server.")
    parser.add_argument("--transport", choices=("stdio", "http"), default="stdio")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    if args.transport == "stdio":
        mcp.run(transport="stdio")
    else:
        mcp.run(transport="http", host=args.host, port=args.port)


if __name__ == "__main__":
    main()
