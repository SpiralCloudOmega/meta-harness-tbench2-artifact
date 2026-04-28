import os
import json
import re
import uuid
from typing import List
from datetime import datetime

WIKI_PATH = "/home/runner/work/meta-harness-tbench2-artifact/meta-harness-tbench2-artifact/.wiki_data"
_WIKILINK_RE = re.compile(r'\[\[([^\]]+)\]\]')


def _extract_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML-style frontmatter from --- blocks. Returns (meta, body)."""
    if content.startswith("---"):
        end = content.find("\n---", 3)
        if end != -1:
            fm_text = content[3:end].strip()
            body = content[end + 4:].strip()
            meta = {}
            for line in fm_text.splitlines():
                if ":" in line:
                    k, _, v = line.partition(":")
                    meta[k.strip()] = v.strip()
            return meta, body
    return {}, content


def _extract_wikilinks(text: str) -> List[str]:
    """Extract [[WikiLink]] style links from text."""
    return _WIKILINK_RE.findall(text)


class WikiEngine:
    def __init__(self):
        os.makedirs(WIKI_PATH, exist_ok=True)

    def _list_page_files(self) -> List[str]:
        try:
            return [f for f in os.listdir(WIKI_PATH) if f.endswith(".json")]
        except Exception:
            return []

    async def ingest(self, url_or_content: str, title: str = "") -> dict:
        page_id = str(uuid.uuid4())
        fm, body = _extract_frontmatter(url_or_content)
        if not title:
            title = fm.get("title", url_or_content[:50].strip().replace("\n", " "))
        tags = fm.get("tags", "").split(",") if fm.get("tags") else []
        wikilinks = _extract_wikilinks(url_or_content)
        page = {
            "id": page_id,
            "title": title,
            "content": url_or_content,
            "body": body,
            "frontmatter": fm,
            "tags": [t.strip() for t in tags if t.strip()],
            "wikilinks": wikilinks,
            "created_at": datetime.utcnow().isoformat(),
        }
        path = os.path.join(WIKI_PATH, f"{page_id}.json")
        with open(path, "w") as f:
            json.dump(page, f, indent=2)

        # Try to call llm-wiki-compiler CLI if available
        try:
            import subprocess
            result = subprocess.run(
                ["npx", "llm-wiki-compiler", "--stdin", "--title", title],
                input=url_or_content,
                capture_output=True, text=True, timeout=15,
            )
            if result.returncode == 0 and result.stdout:
                page["compiled_output"] = result.stdout[:500]
                with open(path, "w") as f:
                    json.dump(page, f, indent=2)
        except Exception:
            pass

        return {"id": page_id, "title": title, "status": "ingested", "wikilinks": wikilinks, "tags": page["tags"]}

    async def compile_wiki(self) -> dict:
        files = self._list_page_files()
        pages = []
        for fn in files:
            try:
                with open(os.path.join(WIKI_PATH, fn)) as f:
                    pages.append(json.load(f))
            except Exception:
                pass
        wikilinks_total = 0
        for page in pages:
            # Auto-link: find [[Title]] refs and add title-based refs
            existing = set(page.get("wikilinks", []))
            for other in pages:
                if other["id"] != page["id"]:
                    if other["title"].lower() in page.get("content", "").lower():
                        existing.add(other["title"])
            page["wikilinks"] = list(existing)
            wikilinks_total += len(existing)
            path = os.path.join(WIKI_PATH, f"{page['id']}.json")
            with open(path, "w") as f:
                json.dump(page, f, indent=2)
        return {"status": "compiled", "page_count": len(pages), "wikilinks": wikilinks_total}

    async def list_pages(self) -> List[dict]:
        files = self._list_page_files()
        pages = []
        for fn in files:
            try:
                with open(os.path.join(WIKI_PATH, fn)) as f:
                    page = json.load(f)
                pages.append({
                    "id": page["id"],
                    "title": page["title"],
                    "tags": page.get("tags", []),
                    "wikilinks": page.get("wikilinks", []),
                    "created_at": page.get("created_at", ""),
                    "preview": page.get("body", page.get("content", ""))[:120],
                })
            except Exception:
                pass
        return pages

    async def query(self, query: str) -> List[dict]:
        files = self._list_page_files()
        results = []
        q = query.lower()
        for fn in files:
            try:
                with open(os.path.join(WIKI_PATH, fn)) as f:
                    page = json.load(f)
                if q in page.get("content", "").lower() or q in page.get("title", "").lower():
                    results.append({
                        "id": page["id"],
                        "title": page["title"],
                        "tags": page.get("tags", []),
                        "preview": page.get("body", page.get("content", ""))[:200],
                        "wikilinks": page.get("wikilinks", []),
                    })
            except Exception:
                pass
        return results
