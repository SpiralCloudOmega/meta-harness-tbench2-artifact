import os
import json
import uuid
from typing import List
from datetime import datetime

WIKI_PATH = "/home/runner/work/meta-harness-tbench2-artifact/meta-harness-tbench2-artifact/.wiki_data"


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
        if not title:
            title = url_or_content[:50].strip().replace("\n", " ")
        page = {
            "id": page_id,
            "title": title,
            "content": url_or_content,
            "created_at": datetime.utcnow().isoformat(),
            "wikilinks": [],
        }
        path = os.path.join(WIKI_PATH, f"{page_id}.json")
        with open(path, "w") as f:
            json.dump(page, f, indent=2)
        return {"id": page_id, "title": title, "status": "ingested"}

    async def compile_wiki(self) -> dict:
        files = self._list_page_files()
        pages = []
        for fn in files:
            try:
                with open(os.path.join(WIKI_PATH, fn)) as f:
                    page = json.load(f)
                pages.append(page)
            except Exception:
                pass
        wikilinks_total = 0
        for page in pages:
            links = []
            for other in pages:
                if other["id"] != page["id"] and other["title"].lower() in page["content"].lower():
                    links.append(other["title"])
            page["wikilinks"] = links
            wikilinks_total += len(links)
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
                entry = {k: v for k, v in page.items() if k != "content"}
                entry["preview"] = page.get("content", "")[:120]
                pages.append(entry)
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
                        "preview": page.get("content", "")[:200],
                        "wikilinks": page.get("wikilinks", []),
                    })
            except Exception:
                pass
        return results
