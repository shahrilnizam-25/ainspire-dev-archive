from __future__ import annotations

import os
import re
from collections.abc import Awaitable, Callable
from typing import Any
from urllib.parse import urlencode

import httpx

from .catalog import Dimension, Language, Persona

_VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
_DIMENSION_QUERIES: dict[str, str] = {
    "aiExposure": "generative AI fundamentals introduction",
    "aiApplication": "practical AI workflow prompt engineering tutorial",
    "criticalJudgement": "responsible AI output evaluation verification",
    "aiProblemSolving": "AI use case problem definition solution design",
}
_DIMENSION_LABELS: dict[str, dict[str, str]] = {
    "EN": {
        "aiExposure": "AI Exposure",
        "aiApplication": "AI Application",
        "criticalJudgement": "Critical Judgement",
        "aiProblemSolving": "AI Problem Solving",
    },
    "BM": {
        "aiExposure": "Pendedahan AI",
        "aiApplication": "Aplikasi AI",
        "criticalJudgement": "Pertimbangan Kritis",
        "aiProblemSolving": "Penyelesaian Masalah AI",
    },
}
_PERSONA_QUERIES: dict[str, str] = {
    "explorer": "AI beginners tutorial",
    "builder": "AI application tutorial",
    "strategist": "AI business use cases",
    "visionary": "AI business use cases",
}
_CURATED: dict[str, tuple[str, str, str]] = {
    "foundations": ("G2fqAlgmoPo", "Introduction to Generative AI", "Google Cloud Tech"),
    "prompting": ("GElCu2kUlRs", "Prompt Engineering Fundamentals", "Microsoft Developer"),
    "building": ("0Y5Luf5sRQA", "Building Text Generation Applications", "Microsoft Developer"),
    "overview": ("k7HaeJs-N-o", "Generative AI for Beginners - Full Series", "Microsoft Developer"),
}
_REQUEST_TIMEOUT = 4.0


def _build_search_query(weakest_dimensions: list[Dimension], persona: Persona) -> str:
    if not 1 <= len(weakest_dimensions) <= 2:
        raise ValueError("Provide one or two capability dimensions for the learning focus.")
    topics = [_DIMENSION_QUERIES[dimension] for dimension in weakest_dimensions]
    return f"{' '.join(topics)} {_PERSONA_QUERIES[persona]}"


def _learning_reason(focus: str, language: Language) -> str:
    if language == "BM":
        return f"Fokus pembelajaran: {focus}. Dipilih untuk menyokong dimensi keupayaan dengan skor terendah anda."
    return f"Learning focus: {focus}. Selected to support your lowest-scoring capability dimensions."


def _video_card(
    video_id: str,
    title: str,
    channel: str,
    description: str,
    query: str,
    source: str,
    status: str,
) -> dict[str, str]:
    return {
        "title": title,
        "description": description,
        "video_title": title,
        "video_url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "channel_title": channel,
        "relevance_statement": description,
        "video_source": source,
        "search_query": query,
        "search_url": "https://www.youtube.com/results?" + urlencode({"search_query": query}),
        "search_status": status,
    }


def _parse_search_items(
    items: list[dict[str, Any]], description: str, query: str
) -> list[dict[str, str]]:
    videos: list[dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        identifier = item.get("id")
        snippet = item.get("snippet")
        if not isinstance(identifier, dict) or not isinstance(snippet, dict):
            continue
        video_id = identifier.get("videoId")
        title = snippet.get("title")
        channel = snippet.get("channelTitle")
        if isinstance(video_id, str) and _VIDEO_ID.fullmatch(video_id) and isinstance(title, str) and title:
            videos.append(
                _video_card(
                    video_id,
                    title,
                    channel if isinstance(channel, str) and channel else "YouTube",
                    description,
                    query,
                    "youtube-api",
                    "live",
                )
            )
    return videos[:2]


async def _fetch_search_items(query: str, key: str) -> list[dict[str, Any]]:
    params = {
        "part": "snippet",
        "type": "video",
        "maxResults": "5",
        "safeSearch": "strict",
        "order": "relevance",
        "videoEmbeddable": "true",
        "videoSyndicated": "true",
        "relevanceLanguage": "en",
        "regionCode": "MY",
        "q": query,
        "key": key,
    }
    async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
        response = await client.get("https://www.googleapis.com/youtube/v3/search", params=params)
        response.raise_for_status()
        payload = response.json()
    items = payload.get("items", []) if isinstance(payload, dict) else []
    return items if isinstance(items, list) else []


def _curated_videos(
    weakest_dimensions: list[Dimension], persona: Persona
) -> list[tuple[str, str, str]]:
    if weakest_dimensions[0] == "aiExposure":
        return [_CURATED["foundations"], _CURATED["prompting"]]
    if persona == "builder":
        return [_CURATED["prompting"], _CURATED["building"]]
    if persona == "explorer":
        return [_CURATED["foundations"], _CURATED["prompting"]]
    return [_CURATED["overview"], _CURATED["prompting"]]


async def get_learning_videos(
    persona: Persona,
    language: Language,
    weakest_dimensions: list[Dimension],
    *,
    search: Callable[[str, str], Awaitable[list[dict[str, Any]]]] = _fetch_search_items,
) -> list[dict[str, str]]:
    """Search YouTube for relevant lessons, using curated links if unavailable."""
    query = _build_search_query(weakest_dimensions, persona)
    focus = " + ".join(_DIMENSION_LABELS[language][dimension] for dimension in weakest_dimensions)
    reason = _learning_reason(focus, language)
    keys = [os.environ.get("YOUTUBE_API_KEY"), os.environ.get("YOUTUBE_API_KEY_BACKUP")]
    configured_keys = [key for key in keys if key]

    for key in configured_keys:
        try:
            items = await search(query, key)
        except (httpx.HTTPError, ValueError, TypeError):
            continue
        videos = _parse_search_items(items, reason, query)
        if videos:
            return videos

    status = "curated-fallback" if configured_keys else "curated-no-key"
    return [
        _video_card(video_id, title, channel, reason, query, "curated", status)
        for video_id, title, channel in _curated_videos(weakest_dimensions, persona)
    ]
