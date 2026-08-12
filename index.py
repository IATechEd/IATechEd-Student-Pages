from flask import Flask, render_template

app = Flask(__name__, template_folder="./assets", static_folder="./assets")

@app.route("/")
def index():
    return "Working!"

@app.route("/base")
def base():
    return render_template("./pages/base.html")

if __name__ == '__main__':
    app.run(debug=True)