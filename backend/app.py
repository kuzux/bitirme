from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hello 492"

@app.route('/group-by/<interval>/<operation>')
def group_by(interval, operation):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max']
    
    if not interval in intervals:
        return "Invalid time interval"

    if not operation in ops:
        return "Invalid operation"

    return "Group by"

@app.route('/upload', methods=["POST"])
def upload():
    return "No upload yet"

app.run(debug=True)
