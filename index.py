from flask import Flask, redirect, render_template, url_for
from os import path
import json

app = Flask(__name__, template_folder="./assets", static_folder="./assets/documents/")

@app.route("/")
def index():
    return "Working!"

@app.route("/<string:student>")
def studentPage(student):
    filePath = f"./assets/users/{student}.json"
    if path.exists(filePath):
        with open(filePath, "r") as file:
            jsonFile = json.loads(file.read())
            file.close()
        return render_template(
                "./pages/student.html",
                **jsonFile
            )
    return redirect(url_for("index"))

if __name__ == '__main__':
    app.run(debug=True)