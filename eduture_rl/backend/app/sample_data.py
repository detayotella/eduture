from __future__ import annotations

from collections import defaultdict

from .models import ContentFragment

QUESTIONNAIRE_QUESTIONS = [
    {"question_id": f"q{i}", "text": f"Question {i}: Honey & Mumford diagnostic item.", "style": style}
    for i, style in zip(
        range(1, 81),
        ["activist"] * 20 + ["reflector"] * 20 + ["theorist"] * 20 + ["pragmatist"] * 20,
        strict=True,
    )
]

CONTENT_SEED = [
    {
        "module_id": "icdl-essentials",
        "topic_id": "computer-basics",
        "content_type": "theory",
        "sequence_order": 1,
        "title": "Introduction to Computer Essentials",
        "content_data": "Understand the purpose of a computer, common hardware, and safe working habits.",
        "difficulty": 0.2,
    },
    {
        "module_id": "icdl-essentials",
        "topic_id": "computer-basics",
        "content_type": "example",
        "sequence_order": 2,
        "title": "Hardware in Practice",
        "content_data": "See how the CPU, memory, and storage work together in a real workflow.",
        "difficulty": 0.35,
    },
    {
        "module_id": "icdl-essentials",
        "topic_id": "computer-basics",
        "content_type": "activity",
        "sequence_order": 3,
        "title": "Identify the Components",
        "content_data": "Match hardware parts to their function using the desktop simulator.",
        "difficulty": 0.45,
    },
    {
        "module_id": "icdl-essentials",
        "topic_id": "computer-basics",
        "content_type": "exercise",
        "sequence_order": 4,
        "title": "Basics Checkpoint",
        "content_data": "Answer a short knowledge check and receive adaptive feedback.",
        "difficulty": 0.5,
    },
    {
        "module_id": "icdl-productivity",
        "topic_id": "documents",
        "content_type": "theory",
        "sequence_order": 1,
        "title": "Working with Documents",
        "content_data": "Learn file organization, document structure, and editing habits.",
        "difficulty": 0.3,
    },
    {
        "module_id": "icdl-productivity",
        "topic_id": "documents",
        "content_type": "example",
        "sequence_order": 2,
        "title": "Document Workflow Example",
        "content_data": "Follow a realistic workflow for creating and sharing a document.",
        "difficulty": 0.4,
    },
    {
        "module_id": "icdl-productivity",
        "topic_id": "documents",
        "content_type": "activity",
        "sequence_order": 3,
        "title": "Organize the Workspace",
        "content_data": "Arrange files and folders to mirror a clean office workflow.",
        "difficulty": 0.55,
    },
    {
        "module_id": "icdl-productivity",
        "topic_id": "documents",
        "content_type": "exercise",
        "sequence_order": 4,
        "title": "Documents Assessment",
        "content_data": "Demonstrate mastery through a guided exercise and short quiz.",
        "difficulty": 0.65,
    },
]

MODULE_SUMMARIES = {
    "icdl-essentials": {
        "module_id": "icdl-essentials",
        "title": "ICDL Computer Essentials",
        "description": "Foundational computing concepts for first-time learners.",
        "topics": ["computer-basics"],
    },
    "icdl-productivity": {
        "module_id": "icdl-productivity",
        "title": "ICDL Productivity",
        "description": "Core document workflows and adaptive practice tasks.",
        "topics": ["documents"],
    },
}


def build_questionnaire_by_style() -> dict[str, list[dict]]:
    grouped = defaultdict(list)
    for question in QUESTIONNAIRE_QUESTIONS:
        grouped[question["style"]].append(question)
    return grouped


def seed_content_rows() -> list[ContentFragment]:
    return [ContentFragment(**row) for row in CONTENT_SEED]
