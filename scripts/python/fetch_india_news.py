#!/usr/bin/env python3
"""Fetch India business RSS feeds and output RawSourceArticle-compatible JSON."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from typing import Any
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


USER_AGENT = "IndiaBusinessDispatchBot/1.0 (+local-dev)"


@dataclass
class Connector:
    connector_id: str
    source: str
    url: str


CONNECTORS = [
    Connector(
        connector_id="reuters-india-rss",
        source="Reuters India RSS",
        url="https://feeds.reuters.com/reuters/INbusinessNews",
    ),
    Connector(
        connector_id="pib-business-rss",
        source="PIB Business RSS",
        url="https://pib.gov.in/RssMain.aspx?ModId=3&Lang=1&Regid=3",
    ),
    Connector(
        connector_id="rbi-api",
        source="RBI Bulletin",
        url="https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx",
    ),
]

FALLBACK_BODIES = [
    "India business update: manufacturing investment pipelines remain active across western and southern corridors. Companies are balancing expansion speed with execution risk by combining phased capex, local sourcing, and workforce planning in each state. Policy updates are generally supportive, but implementation detail varies by authority and timeline, so practical verification remains essential for budgeting and launch sequencing.",
    "Market operations update: logistics and customs lead times show mixed recovery by route. Export-oriented firms are redesigning buffer stock policies and supplier allocation to avoid concentration risk. Parallel tracking of FX, rates, and fuel costs has become a baseline management practice, as margin pressure can rise quickly when one variable moves faster than procurement cycles.",
    "Talent and regulatory update: hiring quality and retention are now treated as core operating constraints rather than HR-only topics. Teams are introducing clearer role definitions, onboarding templates, and compliance checklists to shorten time-to-productivity. Execution quality improves when legal, operations, and commercial teams share one decision cadence and one escalation path.",
]


def clean_html_text(value: str) -> str:
    plain = re.sub(r"<[^>]+>", " ", value)
    plain = unescape(plain)
    return re.sub(r"\s+", " ", plain).strip()


def parse_rfc822_date(value: str) -> str:
    value = value.strip()
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
        "%Y-%m-%dT%H:%M:%SZ",
    ):
        try:
            dt = datetime.strptime(value, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.date().isoformat()
        except ValueError:
            continue
    return datetime.now(timezone.utc).date().isoformat()


def parse_rss(xml_bytes: bytes, connector: Connector, limit: int) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_bytes)
    items = root.findall(".//item")
    output: list[dict[str, Any]] = []

    for item in items[:limit]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        guid = (item.findtext("guid") or link or title).strip()
        pub_date_raw = item.findtext("pubDate") or item.findtext("published") or ""
        description = item.findtext("description") or item.findtext("content") or ""
        body = clean_html_text(description)

        if not title or not link:
            continue

        output.append(
            {
                "connectorId": connector.connector_id,
                "externalId": guid,
                "source": connector.source,
                "title": title,
                "url": link,
                "publishedAt": parse_rfc822_date(pub_date_raw),
                "bodyText": body if body else title,
                "imageUrl": f"https://picsum.photos/seed/{abs(hash(title)) % 100000}/1200/675",
            }
        )

    return output


def fetch_feed(connector: Connector, limit: int) -> list[dict[str, Any]]:
    request = Request(connector.url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        content = response.read()
    return parse_rss(content, connector, limit)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch India business feeds")
    parser.add_argument("--limit", type=int, default=10, help="max items per feed")
    parser.add_argument(
        "--output",
        type=str,
        default="",
        help="optional output file path (defaults to stdout)",
    )
    args = parser.parse_args()

    all_articles: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for connector in CONNECTORS:
        try:
            all_articles.extend(fetch_feed(connector, args.limit))
        except Exception as exc:  # pragma: no cover
            errors.append({"connectorId": connector.connector_id, "error": str(exc)})

    if not all_articles:
        today = datetime.now(timezone.utc).date().isoformat()
        for index, connector in enumerate(CONNECTORS):
            body = FALLBACK_BODIES[index % len(FALLBACK_BODIES)]
            all_articles.append(
                {
                    "connectorId": connector.connector_id,
                    "externalId": f"fallback-{connector.connector_id}-{today}",
                    "source": f"{connector.source} (fallback)",
                    "title": f"Fallback India brief from {connector.source}",
                    "url": connector.url,
                    "publishedAt": today,
                    "bodyText": body,
                    "imageUrl": f"https://picsum.photos/seed/{connector.connector_id}/1200/675",
                }
            )

    payload = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "rawArticles": all_articles,
        "errors": errors,
    }

    rendered = json.dumps(payload, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(rendered)
    else:
        print(rendered)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
