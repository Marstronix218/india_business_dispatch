#!/usr/bin/env python3
"""Fetch India business RSS feeds and output RawSourceArticle-compatible JSON."""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from typing import Any
from urllib.parse import urlencode, urlparse
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
        connector_id="google-news-india-business",
        source="Google News RSS (India Business)",
        url=(
            "https://news.google.com/rss/search?"
            "q=india+business+economy&hl=en-IN&gl=IN&ceid=IN:en"
        ),
    ),
    Connector(
        connector_id="google-news-india-manufacturing",
        source="Google News RSS (India Manufacturing)",
        url=(
            "https://news.google.com/rss/search?"
            "q=india+manufacturing+investment&hl=en-IN&gl=IN&ceid=IN:en"
        ),
    ),
    Connector(
        connector_id="google-news-india-logistics",
        source="Google News RSS (India Logistics)",
        url=(
            "https://news.google.com/rss/search?"
            "q=india+logistics+infrastructure&hl=en-IN&gl=IN&ceid=IN:en"
        ),
    ),
    Connector(
        connector_id="google-news-india-policy",
        source="Google News RSS (India Policy)",
        url=(
            "https://news.google.com/rss/search?"
            "q=india+policy+regulation+business&hl=en-IN&gl=IN&ceid=IN:en"
        ),
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


def build_evidence_snippets(text: str, max_items: int = 3) -> list[str]:
    cleaned = clean_html_text(text)
    if not cleaned:
        return []

    parts = re.split(r"(?<=[.!?。])\s+", cleaned)
    snippets: list[str] = []

    for part in parts:
        snippet = part.strip()
        if len(snippet) < 40:
            continue
        snippets.append(snippet[:220])
        if len(snippets) >= max_items:
            break

    return snippets


def is_probable_article_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    if parsed.scheme not in ("http", "https"):
        return False

    if not parsed.netloc:
        return False

    blocked_hosts = {
        "news.google.com",
        "www.news.google.com",
    }
    if parsed.netloc.lower() in blocked_hosts:
        return False

    path = parsed.path or "/"
    if path in ("", "/"):
        return False

    lowered = path.lower()
    disallowed_tokens = [
        "/category/",
        "/tag/",
        "/author/",
        "/search",
        "/topics/",
        "/topic/",
        "/contact",
        "/about",
        "/feed",
    ]
    if any(token in lowered for token in disallowed_tokens):
        return False

    if lowered.endswith((".jpg", ".jpeg", ".png", ".gif", ".svg", ".css", ".js")):
        return False

    segments = [segment for segment in path.split("/") if segment]
    if not segments:
        return False

    if len(segments) == 1:
        slug = segments[0]
        if "-" not in slug or len(slug) < 20:
            return False

    return True


def resolve_final_url(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=15) as response:
        return response.geturl()


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

        if not is_probable_article_url(link):
            continue

        canonical_url = link
        try:
            canonical_url = resolve_final_url(link)
        except Exception:
            canonical_url = link

        if not is_probable_article_url(canonical_url):
            continue

        fetched_at = datetime.now(timezone.utc).isoformat()

        output.append(
            {
                "connectorId": connector.connector_id,
                "externalId": guid,
                "source": connector.source,
                "title": title,
                "url": canonical_url,
                "publishedAt": parse_rfc822_date(pub_date_raw),
                "bodyText": body if body else title,
                "originalTitle": title,
                "originalPublishedAt": parse_rfc822_date(pub_date_raw),
                "canonicalUrl": canonical_url,
                "fetchedAt": fetched_at,
                "extractedBy": "rss-link+description",
                "sourceLanguage": "en",
                "evidenceSnippets": build_evidence_snippets(body if body else title),
            }
        )

    return output


def fetch_feed(connector: Connector, limit: int) -> list[dict[str, Any]]:
    request = Request(connector.url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        content = response.read()
    return parse_rss(content, connector, limit)


def fetch_gnews_api(limit: int) -> tuple[list[dict[str, Any]], str | None]:
    api_key = os.getenv("GNEWS_API_KEY", "").strip()
    if not api_key:
        return [], "skipped: set GNEWS_API_KEY to enable gnews connector"

    query = os.getenv(
        "GNEWS_QUERY",
        "india business OR india economy OR india infrastructure OR india regulation",
    )
    lang = os.getenv("GNEWS_LANG", "en")
    country = os.getenv("GNEWS_COUNTRY", "in")

    params = urlencode(
        {
            "q": query,
            "lang": lang,
            "country": country,
            "max": min(max(limit, 1), 50),
            "apikey": api_key,
        }
    )
    endpoint = f"https://gnews.io/api/v4/search?{params}"

    request = Request(endpoint, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))

    rows = payload.get("articles") or []
    output: list[dict[str, Any]] = []

    for row in rows:
        title = (row.get("title") or "").strip()
        link = (row.get("url") or "").strip()
        published_raw = (row.get("publishedAt") or "").strip()
        source_name = (row.get("source") or {}).get("name") or "GNews"
        description = clean_html_text((row.get("description") or "").strip())
        content = clean_html_text((row.get("content") or "").strip())
        body = " ".join(part for part in [description, content] if part).strip()

        if not title or not link:
            continue

        if not is_probable_article_url(link):
            continue

        canonical_url = link
        try:
            canonical_url = resolve_final_url(link)
        except Exception:
            canonical_url = link

        if not is_probable_article_url(canonical_url):
            continue

        published_at = parse_rfc822_date(published_raw)
        fetched_at = datetime.now(timezone.utc).isoformat()

        output.append(
            {
                "connectorId": "gnews-api",
                "externalId": canonical_url,
                "source": source_name,
                "title": title,
                "url": canonical_url,
                "publishedAt": published_at,
                "bodyText": body if body else title,
                "originalTitle": title,
                "originalPublishedAt": published_at,
                "canonicalUrl": canonical_url,
                "fetchedAt": fetched_at,
                "extractedBy": "gnews-api+url-resolve",
                "sourceLanguage": lang,
                "evidenceSnippets": build_evidence_snippets(body if body else title),
            }
        )

    return output, None


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch India business feeds")
    parser.add_argument("--limit", type=int, default=10, help="max items per feed")
    parser.add_argument(
        "--output",
        type=str,
        default="",
        help="optional output file path (defaults to stdout)",
    )
    parser.add_argument(
        "--allow-fallback",
        action="store_true",
        help="emit synthetic fallback entries when all sources fail",
    )
    args = parser.parse_args()

    all_articles: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for connector in CONNECTORS:
        try:
            all_articles.extend(fetch_feed(connector, args.limit))
        except Exception as exc:  # pragma: no cover
            errors.append({"connectorId": connector.connector_id, "error": str(exc)})

    try:
        gnews_articles, gnews_error = fetch_gnews_api(args.limit)
        all_articles.extend(gnews_articles)
        if gnews_error:
            errors.append({"connectorId": "gnews-api", "error": gnews_error})
    except Exception as exc:  # pragma: no cover
        errors.append({"connectorId": "gnews-api", "error": str(exc)})

    if not all_articles and args.allow_fallback:
        today = datetime.now(timezone.utc).date().isoformat()
        fetched_at = datetime.now(timezone.utc).isoformat()
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
                    "originalTitle": f"Fallback India brief from {connector.source}",
                    "originalPublishedAt": today,
                    "canonicalUrl": connector.url,
                    "fetchedAt": fetched_at,
                    "extractedBy": "synthetic-fallback",
                    "sourceLanguage": "en",
                    "evidenceSnippets": build_evidence_snippets(body),
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
