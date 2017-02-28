from flask import Flask, request
import json
import datetime

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hello 492"

data = []

@app.route('/group-by/<field>/<operation>'):
def group_by(field, operation):
    ops = ['sum', 'product', 'min', 'max']

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_data(data, field, operation)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res}

@app.route('/group-by-time/<interval>/<operation>')
def group_by_time(interval, operation):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max']
    
    if not interval in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval"})

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_data_time(data, interval, operation)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res}

@app.route('/raw')
def raw():
    return json.dumps(data)

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

def group_data(data, field, operation):
    groups = {}

    for elem in data:
        if field not in elem:
            return None

        if elem[field] in groups:
            groups[elem[field]].append(elem)
        else:
            groups[elem[field]] = [elem]

    mappers = {
        'sum': sum, 
        'product': lambda a: reduce(lambda x, y: x * y, a), 
        'min': min, 
        'max': max
    }

    return { k: mappers[operation] for k, v in groups } 

def group_data_time(data, interval, operation):
    res = [[]]
    for elem in data:
        last_group = None
        if len(res[0]) == 0:
            d = datetime.datetime.fromtimestamp(elem['date'])

            if interval == 'month':
                last_group = datetime.datetime(d.year, d.month, 1)
            elif interval == 'week':
                last_group = datetime.datetime(d.year, d.month, d.day)
                last_group -= datetime.timedelta(days=d.weekday())
            elif interval == 'day':
                last_group = datetime.datetime(d.year, d.month, d.day)
            elif interval == 'hour':
                last_group = datetime.datetime(d.year, d.month, d.day, d.hour)
            else:
                raise ValueError

            res[-1].append((last_group, elem))
        else:
            last_group = res[-1][0][0]

    return res

app.run(debug=True)
