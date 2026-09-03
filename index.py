from flask import Flask, redirect, render_template, url_for, request
from os import path, listdir
import json

app = Flask(__name__, template_folder="./assets", static_folder="assets/static", static_url_path="/static")
studentNames = [x.split(".")[0] for x in listdir("./assets/users")]

students = []
for i in listdir("./assets/users"):
    with open(f"./assets/users/{i}", "r") as file:
            jsonFile = json.loads(file.read())
            file.close()
    
    students.append({
            "name": jsonFile["name"],
            "pageUrl": f"{jsonFile["name"].lower()}",
            "photoUrl": jsonFile["photoURL"]
        })


@app.route("/")
def index():
    return render_template(
            "./pages/index.html",
            students=students,
            pageUrl=request.base_url
        )

@app.route("/<string:student>")
def studentPage(student):
    filePath = f"./assets/users/{student}.json"
    if path.exists(filePath):
        with open(filePath, "r") as file:
            jsonFile = json.loads(file.read())
            file.close()
        return render_template(
                "./pages/student.html",
                **jsonFile,
                pageUrl=request.base_url
            )
    return redirect(url_for("index"))

if __name__ == '__main__':
    app.run(debug=True)