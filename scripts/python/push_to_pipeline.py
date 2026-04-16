#!/usr/bin/env python3
"""Run RSS fetch script and POST rawArticles to Next.js scrape API."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from urllib.request import Request, urlopen


def run_fetch_script(limit: int) -> dict:
    script_path = Path(__file__).with_name("fetch_india_news.py")
    result = subprocess.run(
        ["python3", str(script_path), "--limit", str(limit)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def post_payload(api_url: str, raw_articles: list[dict]) -> dict:
    request_body = json.dumps({"rawArticles": raw_articles}).encode("utf-8")
    request = Request(
        api_url,
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=30) as response:
        content = response.read().decode("utf-8")
    return json.loads(content)


def main() -> int:
    parser = argparse.ArgumentParser(description="Push fetched articles to Next pipeline")
    parser.add_argument(
        "--api-url",
        default="http://localhost:3000/api/scrape/run",
        help="Next API endpoint",
    )
    parser.add_argument("--limit", type=int, default=10, help="items per connector")
    args = parser.parse_args()

    fetched = run_fetch_script(args.limit)
    raw_articles = fetched.get("rawArticles", [])

    if not raw_articles:
        print(json.dumps({"ok": False, "error": "No raw articles fetched"}, ensure_ascii=False))
        return 1

    response = post_payload(args.api_url, raw_articles)
    print(json.dumps({"fetched": len(raw_articles), "pipeline": response}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
