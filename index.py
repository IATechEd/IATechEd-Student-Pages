import json
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

from flask import Flask, redirect, render_template, request, url_for

BASE_DIRECTORY = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIRECTORY / "assets"
STUDENTS_DIR = ASSETS_DIR / "students"

app = Flask(
    __name__,
    template_folder=str(ASSETS_DIR),
    static_folder=str(ASSETS_DIR / "static"),
    static_url_path="/static",
)


def load_student(file_path: Path) -> dict[str, Any]:
    with file_path.open(encoding="utf-8") as file:
        return json.load(file)


def load_student_summaries() -> list[dict[str, str]]:
    summaries = []

    for file_path in sorted(STUDENTS_DIR.glob("*.json")):
        student = load_student(file_path)
        summaries.append(
            {
                "name": student["name"],
                "slug": file_path.stem,
                "photoUrl": student["photoUrl"],
            }
        )

    return summaries


def make_url_absolute(url: str) -> str:
    return urljoin(request.url_root, url)


students = load_student_summaries()


@app.route("/")
def index():
    student_metadata = [
        {
            **student,
            "pageUrl": url_for(
                "student_page",
                student=student["slug"],
                _external=True,
            ),
            "photoUrl": make_url_absolute(student["photoUrl"]),
        }
        for student in students
    ]

    return render_template(
        "pages/index.html",
        students=student_metadata,
        pageUrl=request.base_url,
        ogImageUrl=url_for(
            "static",
            filename="images/favicon.svg",
            _external=True,
        ),
    )


@app.route("/<string:student>")
def student_page(student: str):
    file_path = STUDENTS_DIR / f"{student}.json"

    if not file_path.is_file():
        return redirect(url_for("index"))

    student_data = load_student(file_path)
    return render_template(
        "pages/student.html",
        **student_data,
        pageUrl=request.base_url,
        ogImageUrl=make_url_absolute(student_data["photoUrl"]),
    )


if __name__ == "__main__":
    app.run(debug=True)
