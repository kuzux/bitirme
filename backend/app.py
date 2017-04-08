from __future__ import print_function

from flask import Flask, request

import json
import datetime
import csv
import os
import codecs
import collections

app = Flask(__name__)
decoder = codecs.getreader('utf-8')

@app.route('/')
def index():
    with open('../README.md') as f:
        return f.read()

@app.route('/hello')
def hello():
    return "Hello 492"

global data

@app.route('/group-by/<field>')
def group_by_list(field):
    groups = {}

    for elem in data:
        if field not in elem:
            return json.dumps({"status": "error", "error": "Data processing error"})

        if elem[field] in groups:
            groups[elem[field]].append(elem)
        else:
            groups[elem[field]] = [elem]

    return json.dumps({"status": "ok", "result": groups})

@app.route('/group-by/<interval>')
def group_by_time_list(interval):
    pass

@app.route('/group-by/<field>/<operation>/<op_field>')
def group_by(field, operation, op_field):
    ops = ['sum', 'product', 'min', 'max', 'length', 'id']

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_data(data, field, operation, op_field)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})

@app.route('/group-by-time/<interval>/<operation>')
def group_by_time(interval, operation):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max', 'length']
    
    if not interval in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval"})

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_data_time(data, interval, operation)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})

@app.route('/raw')
def raw():
    return json.dumps(data)

@app.route('/upload', methods=["POST"])
def upload():
    global data
    data = []

    print("geldi")

    file = request.files['file']

    print("napti")

    if file :
        try:
            res = json.load(decoder(file))
            data = res
            return json.dumps({"status": "ok"})
        except ValueError:
            return json.dumps({"status": "error", "error": "JSON parsing error"})

@app.route('/upload/csv', methods=["POST"])
def upload_csv():
    global data
    data = []

    file = request.files['file']
    read = csv.DictReader(file)

    try:
        for row in read:
            data.append(row)
        return json.dumps({"status": "ok"})
    except csv.Error:
        return json.dumps({"status": "error", "error": "CSV parsing error"})

def group_data(data, field, operation, op_field):
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
        'max': max,
        'length': lambda x: len(x),
        'id': lambda x: x
    }

    return { e: mappers[operation](map(lambda x: x[op_field], groups[e])) for e in groups } 

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

        intervals = { 
            'month': datetime.timedelta(days=30),
            'week': datetime.timedelta(days=7),
            'day': datetime.timedelta(days=1),
            'hour': datetime.timedelta(hours=1)
        }

        if (d - last_group) <= intervals[interval]:
            res[-1].append(elem)
        else:
            res.append([elem])

        # todo: do the mappers thing
        
    return res

tens = []

@app.route('/yap')
def tensoryap():
    #tens = []

    for elem in data:
        d = datetime.datetime.fromtimestamp(elem['date'])
        month = datetime.datetime(d.year, d.month, 1)
        week = datetime.datetime(d.year, d.month, d.day)
        week -= datetime.timedelta(days=d.weekday())
        day = datetime.datetime(d.year, d.month, d.day)
        hour = datetime.datetime(d.year, d.month, d.day, d.hour)
        month = str(month)
        week = str(week)
        day = str(day)
        hour = str(hour)
        tens.append([month, week, day, hour, elem])

    if tens is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    #tens = jsonify(tens)
    return json.dumps({"status": "ok", "result": tens})

@app.route('/raw-tensor')
def raw_tensor():
    return json.dumps(tens)

@app.route('/group-time/<interval>')
def group_time(interval):
    res = group_by_time(interval)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})    

def group_by_time(interval):
    groups = {}

    intervals = { 
        'month': 0,
        'week': 1,
        'day': 2,
        'hour': 3
    }

    idx = intervals[interval]

    for elem in tens:
        date = elem[idx]
        print(date)
        d = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
        if interval == 'month':
            el = d.month
        elif interval == 'week':
            el = datetime.datetime(d.year, d.month, d.day)
        elif interval == 'day':
            el = d.day
        elif interval == 'hour':
            el = d.hour
        if str(el) in groups:
            groups[str(el)].append(elem)
        else:
            groups[str(el)] = [elem]

    groups = collections.OrderedDict(sorted(groups.items(), key=lambda t: t[0]))

    return groups

app.run(debug=True)