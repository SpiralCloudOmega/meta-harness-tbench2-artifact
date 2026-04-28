import os
import uuid
from typing import List
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.memory import MemoryItem

PALACE_PATH = "/home/runner/work/meta-harness-tbench2-artifact/meta-harness-tbench2-artifact/.mempalace_data"

_MOCK_MEMORIES = [
    MemoryItem(id="mem1", wing="research", room="notes", content="Lambda-RLM uses recursive decomposition with SPLIT/MAP/REDUCE operators.", metadata={"wing": "research", "room": "notes"}, score=0.95),
    MemoryItem(id="mem2", wing="research", room="notes", content="ChromaDB stores embeddings with cosine similarity search.", metadata={"wing": "research", "room": "notes"}, score=0.88),
    MemoryItem(id="mem3", wing="code", room="snippets", content="FastAPI routers are mounted with app.include_router().", metadata={"wing": "code", "room": "snippets"}, score=0.82),
]


class MemoryEngine:
    def __init__(self):
        self._client = None
        self._mock_mode = False
        os.makedirs(PALACE_PATH, exist_ok=True)
        try:
            import chromadb
            self._chromadb = chromadb
        except ImportError:
            self._mock_mode = True

    def _get_client(self):
        if self._mock_mode:
            return None
        if self._client is None:
            try:
                self._client = self._chromadb.PersistentClient(path=PALACE_PATH)
            except Exception:
                self._mock_mode = True
                return None
        return self._client

    def get_collection(self, wing: str = "default"):
        client = self._get_client()
        if client is None:
            return None
        try:
            return client.get_or_create_collection(name=f"palace_{wing}")
        except Exception:
            self._mock_mode = True
            return None

    async def store(self, wing: str, room: str, content: str, metadata: dict) -> dict:
        item_id = str(uuid.uuid4())
        meta = {**metadata, "wing": wing, "room": room}
        collection = self.get_collection(wing)
        if collection is not None:
            try:
                collection.add(documents=[content], metadatas=[meta], ids=[item_id])
                return {"id": item_id, "status": "stored"}
            except Exception:
                pass
        _MOCK_MEMORIES.append(MemoryItem(id=item_id, wing=wing, room=room, content=content, metadata=meta, score=None))
        return {"id": item_id, "status": "stored"}

    async def search(self, query: str, limit: int = 10, wing: str = "") -> List[MemoryItem]:
        if not self._mock_mode:
            collection = self.get_collection(wing if wing else "default")
            if collection is not None:
                try:
                    count = collection.count()
                    if count > 0:
                        results = collection.query(query_texts=[query], n_results=min(limit, count))
                        items = []
                        docs = results.get("documents", [[]])[0]
                        metas = results.get("metadatas", [[]])[0]
                        ids = results.get("ids", [[]])[0]
                        distances = results.get("distances", [[]])[0]
                        for i, doc in enumerate(docs):
                            meta = metas[i] if i < len(metas) else {}
                            score = 1.0 - distances[i] if i < len(distances) else 0.5
                            items.append(MemoryItem(
                                id=ids[i] if i < len(ids) else str(uuid.uuid4()),
                                wing=meta.get("wing", wing),
                                room=meta.get("room", ""),
                                content=doc,
                                metadata=meta,
                                score=round(score, 3),
                            ))
                        return items
                except Exception:
                    pass
        q = query.lower()
        results = [m for m in _MOCK_MEMORIES if not q or q in m.content.lower()]
        return results[:limit]

    async def list_sessions(self) -> List[dict]:
        if not self._mock_mode:
            client = self._get_client()
            if client is not None:
                try:
                    collections = client.list_collections()
                    return [{"wing": c.name.replace("palace_", ""), "collection": c.name, "count": c.count()} for c in collections]
                except Exception:
                    pass
        return [
            {"wing": "research", "collection": "palace_research", "count": 2},
            {"wing": "code", "collection": "palace_code", "count": 1},
            {"wing": "default", "collection": "palace_default", "count": 0},
        ]
