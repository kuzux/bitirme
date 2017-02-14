from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hello 492"

@app.route('/group-by/<interval>/<operation>')
def group_by(interval, operation):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max']
    
    if not interval in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval"})

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_data(interval, operation)

    if res is not None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return res

data = []

@app.route('/upload', methods=["POST"])
def upload():
    file = request.files['file']
    
    try:
        res = json.load(file)
        global data
        data = res
        return json.dumps({"status": "ok"})
    except ValueError:
        return json.dumps({"status": "error", "error": "JSON parsing error"})

def group_data(interval, operation):
    pass

app.run(debug=True)
