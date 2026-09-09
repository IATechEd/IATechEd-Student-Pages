import json
from pathlib import Path
from typing import Any

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
                "pageUrl": file_path.stem,
                "photoUrl": student["photoUrl"],
            }
        )

    return summaries


students = load_student_summaries()


@app.route("/")
def index():
    return render_template(
        "./pages/index.html",
        students=students,
        pageUrl=request.base_url,
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
    )


if __name__ == "__main__":
    app.run(debug=True)
