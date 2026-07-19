from __future__ import annotations

import re
from typing import Any

from .models import ContentFragment


_OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"]


def _clean_lines(raw: str) -> list[str]:
    return [line.strip() for line in (raw or "").splitlines() if line.strip()]


def _extract_callout(lines: list[str]) -> str | None:
    for line in lines:
        upper = line.upper()
        if upper.startswith("SUMMARY:"):
            return line.split(":", 1)[1].strip() if ":" in line else line
        if upper.startswith("EXPLANATION:"):
            return line.split(":", 1)[1].strip() if ":" in line else line
    return None


def _render_theory_or_example(fragment: ContentFragment) -> dict[str, Any]:
    lines = _clean_lines(fragment.content_data)
    body = "\n\n".join(lines)
    return {
        "kind": "text",
        "title": fragment.title,
        "body": body,
        "callout": _extract_callout(lines),
        "estimated_minutes": fragment.estimated_time_minutes,
    }


def _render_activity(fragment: ContentFragment) -> dict[str, Any]:
    lines = _clean_lines(fragment.content_data)
    tasks: list[str] = []
    for line in lines:
        numbered = re.match(r"^\d+[\)\.]\s+(.*)$", line)
        dashed = re.match(r"^[-•]\s+(.*)$", line)
        if numbered:
            tasks.append(numbered.group(1).strip())
        elif dashed:
            tasks.append(dashed.group(1).strip())

    intro = lines[0] if lines else "Complete the activity tasks below."
    hint = None
    for line in lines:
        if "TASK" in line.upper() or "NOTE" in line.upper():
            hint = line
            break

    return {
        "kind": "task_list",
        "title": fragment.title,
        "intro": intro,
        "tasks": tasks,
        "hint": hint,
        "estimated_minutes": fragment.estimated_time_minutes,
    }


def _parse_exercise_questions(content_data: str) -> list[dict[str, Any]]:
    lines = _clean_lines(content_data)
    questions: list[dict[str, Any]] = []

    current_question: dict[str, Any] | None = None
    options: list[str] = []

    def finalize_question() -> None:
        nonlocal current_question, options
        if current_question is None:
            return
        if options:
            current_question["options"] = options[:]
        current_question.setdefault("options", [])
        current_question.setdefault("answer_index", None)
        questions.append(current_question)
        current_question = None
        options = []

    for line in lines:
        question_match = re.match(r"^QUESTION\s+\d+\s*:\s*(.*)$", line, re.IGNORECASE)
        if question_match:
            finalize_question()
            stem = question_match.group(1).strip()
            current_question = {"question": stem, "options": [], "answer_index": None}
            continue

        option_match = re.match(r"^([A-F])\.\s+(.*)$", line)
        if option_match and current_question is not None:
            options.append(option_match.group(2).strip())
            continue

        answer_match = re.match(r"^CORRECT\s+ANSWER\s*:\s*([A-F])$", line, re.IGNORECASE)
        if answer_match and current_question is not None:
            letter = answer_match.group(1).upper()
            try:
                current_question["answer_index"] = _OPTION_LETTERS.index(letter)
            except ValueError:
                current_question["answer_index"] = None
            continue

    finalize_question()
    return questions


def _render_exercise(fragment: ContentFragment) -> dict[str, Any]:
    questions = _parse_exercise_questions(fragment.content_data)
    return {
        "kind": "quiz",
        "title": fragment.title,
        "questions": questions,
        "estimated_minutes": fragment.estimated_time_minutes,
    }


def build_render_data(fragment: ContentFragment) -> dict[str, Any]:
    content_type = (fragment.content_type or "").lower()
    if content_type in {"theory", "example"}:
        return _render_theory_or_example(fragment)
    if content_type == "activity":
        return _render_activity(fragment)
    if content_type == "exercise":
        return _render_exercise(fragment)
    return {
        "kind": "text",
        "title": fragment.title,
        "body": fragment.content_data,
        "estimated_minutes": fragment.estimated_time_minutes,
    }
