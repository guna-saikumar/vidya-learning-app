#!/usr/bin/env python3
"""Export Postman v2.1 JSON from the local v3 YAML collection."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import parse_qs

try:
    import yaml
except ImportError:
    print("PyYAML is required: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
COLLECTION_DIR = ROOT / "postman" / "collections" / "Vidya API"
OUT = ROOT / "postman" / "Vidya-API.postman_collection.json"
POSTMAN_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"


def folder_meta(folder: Path) -> dict:
    path = folder / ".resources" / "definition.yaml"
    if path.exists():
        return yaml.safe_load(path.read_text()) or {}
    return {}


def parse_url(url: str) -> dict:
    raw = url
    rest = url[len("{{baseUrl}}") :] if url.startswith("{{baseUrl}}") else url
    path_part, _, query = rest.partition("?")
    path_segments = [s for s in path_part.split("/") if s]
    out: dict = {
        "raw": raw,
        "host": ["{{baseUrl}}"],
        "path": path_segments,
    }
    if query:
        out["query"] = [
            {"key": k, "value": v}
            for k, vs in parse_qs(query, keep_blank_values=True).items()
            for v in vs
        ]
    return out


def req_to_item(data: dict) -> dict:
    headers = [
        {"key": k, "value": str(v)} for k, v in (data.get("headers") or {}).items()
    ]
    body = None
    b = data.get("body")
    if b and b.get("content") is not None:
        body = {
            "mode": "raw",
            "raw": b["content"],
            "options": {"raw": {"language": "json"}},
        }
        if not any(h["key"].lower() == "content-type" for h in headers):
            headers.append({"key": "Content-Type", "value": "application/json"})

    auth = None
    a = data.get("auth")
    if a and a.get("type") == "bearer":
        token = (a.get("credentials") or {}).get("token", "")
        auth = {
            "type": "bearer",
            "bearer": [{"key": "token", "value": token, "type": "string"}],
        }

    events = []
    for s in data.get("scripts") or []:
        listen = "test" if s.get("type") == "afterResponse" else "prerequest"
        code = s.get("code") or ""
        events.append(
            {
                "listen": listen,
                "script": {
                    "type": "text/javascript",
                    "exec": code.splitlines() or [""],
                },
            }
        )

    item: dict = {
        "name": data.get("name") or "request",
        "request": {
            "method": data.get("method") or "GET",
            "header": headers,
            "url": parse_url(data.get("url") or ""),
        },
        "_order": data.get("order") or 0,
    }
    if data.get("description"):
        item["request"]["description"] = data["description"]
        item["description"] = data["description"]
    if body:
        item["request"]["body"] = body
    if auth:
        item["request"]["auth"] = auth
    if events:
        item["event"] = events
    return item


def main() -> None:
    defn = yaml.safe_load((COLLECTION_DIR / ".resources" / "definition.yaml").read_text())
    folders = []
    for folder in sorted(
        p for p in COLLECTION_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")
    ):
        meta = folder_meta(folder)
        items = [req_to_item(yaml.safe_load(rf.read_text())) for rf in folder.glob("*.request.yaml")]
        items.sort(key=lambda x: (x.get("_order") or 0, x["name"]))
        for it in items:
            it.pop("_order", None)
        folders.append(
            {
                "name": folder.name,
                "item": items,
                "_order": meta.get("order") or 0,
            }
        )
    folders.sort(key=lambda x: (x.get("_order") or 0, x["name"]))
    for f in folders:
        f.pop("_order", None)

    variables = [
        {"key": k, "value": "" if v is None else str(v)}
        for k, v in (defn.get("variables") or {}).items()
    ]

    collection = {
        "info": {
            "_postman_id": POSTMAN_ID,
            "name": "Vidya API",
            "description": defn.get("description") or "",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "variable": variables,
        "item": folders,
    }

    OUT.write_text(json.dumps(collection, indent=2, ensure_ascii=False) + "\n")
    n_req = sum(len(f["item"]) for f in folders)
    print(f"Wrote {OUT.relative_to(ROOT)} ({len(folders)} folders, {n_req} requests)")


if __name__ == "__main__":
    main()
