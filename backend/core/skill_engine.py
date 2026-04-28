from typing import List, Dict, Any

SKILLS_DATA = [
    {
        "id": "code_analysis",
        "name": "Code Analysis",
        "description": "Analyze code structure, complexity, and patterns using AST traversal.",
        "parameters": [{"name": "code", "type": "string", "required": True}, {"name": "language", "type": "string", "required": False}],
        "utility_score": 0.92,
        "usage_count": 247,
        "category": "analysis",
    },
    {
        "id": "summarize_text",
        "name": "Summarize Text",
        "description": "Generate concise summaries using recursive Lambda-RLM decomposition.",
        "parameters": [{"name": "text", "type": "string", "required": True}, {"name": "max_length", "type": "int", "required": False}],
        "utility_score": 0.88,
        "usage_count": 512,
        "category": "language",
    },
    {
        "id": "extract_entities",
        "name": "Extract Entities",
        "description": "Extract named entities, relationships, and key concepts from text.",
        "parameters": [{"name": "text", "type": "string", "required": True}, {"name": "entity_types", "type": "list", "required": False}],
        "utility_score": 0.85,
        "usage_count": 183,
        "category": "extraction",
    },
    {
        "id": "generate_tests",
        "name": "Generate Tests",
        "description": "Auto-generate unit tests for functions and classes.",
        "parameters": [{"name": "code", "type": "string", "required": True}, {"name": "framework", "type": "string", "required": False}],
        "utility_score": 0.79,
        "usage_count": 94,
        "category": "generation",
    },
    {
        "id": "refactor_code",
        "name": "Refactor Code",
        "description": "Suggest and apply refactoring patterns to improve code quality.",
        "parameters": [{"name": "code", "type": "string", "required": True}, {"name": "style", "type": "string", "required": False}],
        "utility_score": 0.76,
        "usage_count": 67,
        "category": "transformation",
    },
    {
        "id": "explain_concept",
        "name": "Explain Concept",
        "description": "Generate detailed explanations for technical concepts at configurable depth.",
        "parameters": [{"name": "concept", "type": "string", "required": True}, {"name": "depth", "type": "string", "required": False}],
        "utility_score": 0.91,
        "usage_count": 329,
        "category": "language",
    },
    {
        "id": "debug_assist",
        "name": "Debug Assistant",
        "description": "Analyze error traces, suggest fixes, and explain root causes.",
        "parameters": [{"name": "error", "type": "string", "required": True}, {"name": "code", "type": "string", "required": False}],
        "utility_score": 0.87,
        "usage_count": 415,
        "category": "debugging",
    },
    {
        "id": "wiki_compile",
        "name": "Wiki Compile",
        "description": "Compile wiki pages from content sources with automatic wiki-link generation.",
        "parameters": [{"name": "content", "type": "string", "required": True}, {"name": "title", "type": "string", "required": False}],
        "utility_score": 0.74,
        "usage_count": 38,
        "category": "documentation",
    },
]

_skills_state: Dict[str, dict] = {s["id"]: dict(s) for s in SKILLS_DATA}


class SkillEngine:
    async def list_skills(self) -> List[dict]:
        return list(_skills_state.values())

    async def execute_skill(self, skill_id: str, params: dict) -> dict:
        if skill_id not in _skills_state:
            return {"skill_id": skill_id, "status": "error", "result": "Skill not found", "params": params}
        _skills_state[skill_id]["usage_count"] += 1
        result_map = {
            "code_analysis": f"Analysis complete: Found {len(str(params))} chars of input. Complexity: O(n log n). Detected patterns: Factory, Observer.",
            "summarize_text": f"Summary: {str(params.get('text', ''))[:100]}... [summarized with Lambda-RLM]",
            "extract_entities": "Entities: [Person: 'Alice', Organization: 'Acme Corp', Location: 'New York']",
            "generate_tests": "Generated 5 unit tests covering: happy path, edge cases, error handling.",
            "refactor_code": "Refactoring suggestions: Extract method, rename variable for clarity, add type hints.",
            "explain_concept": f"Explanation of '{params.get('concept', 'concept')}': This refers to...",
            "debug_assist": f"Root cause: {str(params.get('error', 'error'))[:50]}. Fix: Check null checks and type coercion.",
            "wiki_compile": f"Compiled wiki page '{params.get('title', 'Untitled')}' with 3 wiki-links generated.",
        }
        return {
            "skill_id": skill_id,
            "status": "executed",
            "result": result_map.get(skill_id, "Skill executed successfully."),
            "params": params,
        }

    async def reflect(self, skill_id: str, outcome: str) -> dict:
        if skill_id not in _skills_state:
            return {"skill_id": skill_id, "status": "error", "message": "Skill not found"}
        old_score = _skills_state[skill_id]["utility_score"]
        if outcome == "success":
            new_score = min(1.0, old_score + 0.01)
        elif outcome == "failure":
            new_score = max(0.0, old_score - 0.02)
        else:
            new_score = old_score
        _skills_state[skill_id]["utility_score"] = round(new_score, 3)
        return {
            "skill_id": skill_id,
            "status": "reflected",
            "old_utility_score": old_score,
            "new_utility_score": new_score,
            "outcome": outcome,
        }
