from __future__ import annotations

import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
import pytest
from fastmcp import Client
from fastmcp.client.transports import StdioTransport

from ainspire_mcp import youtube
from ainspire_mcp.catalog import get_learning_path
from ainspire_mcp.server import mcp


def test_learning_path_has_three_localized_topics() -> None:
    en = get_learning_path("explorer", "EN")
    bm = get_learning_path("explorer", "BM")

    assert len(en) == 3
    assert len(bm) == 3
    assert en[0]["title"] == "AI foundations and safe use"
    assert bm[0]["title"] == "Asas AI dan penggunaan selamat"


def test_invalid_learning_focus_is_rejected() -> None:
    with pytest.raises(ValueError, match="one or two"):
        youtube._build_search_query([], "explorer")
    with pytest.raises(ValueError, match="one or two"):
        youtube._build_search_query(
            ["aiExposure", "aiApplication", "criticalJudgement"], "explorer"
        )


@pytest.mark.asyncio
async def test_missing_key_returns_curated_resources(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("YOUTUBE_API_KEY", raising=False)
    monkeypatch.delenv("YOUTUBE_API_KEY_BACKUP", raising=False)

    videos = await youtube.get_learning_videos("explorer", "EN", ["aiExposure"])

    assert len(videos) == 2
    assert all(video["video_source"] == "curated" for video in videos)
    assert all(video["search_status"] == "curated-no-key" for video in videos)


@pytest.mark.asyncio
async def test_backup_key_is_tried_after_primary_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("YOUTUBE_API_KEY", "primary-test-key")
    monkeypatch.setenv("YOUTUBE_API_KEY_BACKUP", "backup-test-key")
    search = AsyncMock(side_effect=[httpx.ConnectError("quota exceeded"), [{
        "id": {"videoId": "abcdefghijk"},
        "snippet": {"title": "Responsible AI tutorial", "channelTitle": "Test channel"},
    }]])

    videos = await youtube.get_learning_videos(
        "strategist", "BM", ["criticalJudgement"], search=search
    )

    assert [call.args[1] for call in search.await_args_list] == [
        "primary-test-key",
        "backup-test-key",
    ]
    assert videos[0]["video_source"] == "youtube-api"
    assert videos[0]["search_status"] == "live"
    assert "Fokus pembelajaran" in videos[0]["relevance_statement"]
    assert "Pertimbangan Kritis" in videos[0]["relevance_statement"]


@pytest.mark.asyncio
async def test_fastmcp_exposes_tools_and_catalog_resource() -> None:
    async with Client(mcp) as client:
        tools = await client.list_tools()
        tool_names = {tool.name for tool in tools}
        assert {"get_learning_path", "search_learning_videos"} <= tool_names

        result = await client.call_tool(
            "get_learning_path", {"persona": "builder", "language": "BM"}
        )
        assert not result.is_error
        assert "Prototaip dan integrasi AI" in str(result.content)

        catalog = await client.read_resource("learning://catalog/EN")
        assert "explorer" in str(catalog)


@pytest.mark.asyncio
async def test_stdio_server_runs_as_a_local_mcp_subprocess() -> None:
    project_root = Path(__file__).resolve().parents[1]
    source_root = project_root / "src"
    transport = StdioTransport(
        command=sys.executable,
        args=["-m", "ainspire_mcp.server"],
        env={
            "HOME": os.environ.get("HOME", ""),
            "PATH": os.environ.get("PATH", ""),
            "PYTHONPATH": str(source_root),
        },
        cwd=str(project_root),
    )

    async with Client(transport) as client:
        tools = {tool.name for tool in await client.list_tools()}
        assert "get_learning_path" in tools
        result = await client.call_tool(
            "get_learning_path", {"persona": "builder", "language": "BM"}
        )
        assert not result.is_error
