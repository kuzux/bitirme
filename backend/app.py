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

data = []

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

    file = request.files['file'] 

    if file :
        try:
            res = json.load(decoder(file))
            data = res
            return json.dumps({"status": "ok"})
        except ValueError:
            return json.dumps({"status": "error", "error": "JSON parsing error"})

@app.route('/upload/csv', methods=["POST"])
def upload_csv():
    #global data
    data = []

    file = request.files['file']
    read = csv.DictReader(file)

    #TODO: It should be more generic. 

    try:
        for row in read:
            data.append(row)
        return json.dumps({"status": "ok"})
    except csv.Error:
        return json.dumps({"status": "error", "error": "CSV parsing error"})

# CSV uploader for the trafo example
@app.route('/upload/csv1', methods=["POST"])
def upload_csv1():
    fieldnames = ("SAYACNO","TESNO","DAY", "HOUR", "ENDUKTIF", "KAPASITIF", "AKTIF")
    #global data
    data = []

    file = request.files['file']
    read = csv.DictReader(file, fieldnames=fieldnames, delimiter=';')

    try:
        for row in read:
            data.append(row)

        # removes the first data, the one with titles 
        data.pop(0)
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


#### TIME TENSOR REPRESENTATION & FOlDINGS ####

# indexed tensor data, held in lil form.(sparse matrix representation)
tens = []

# If there is a 'date' field in data, which consists of a timestamp, use this.
@app.route('/build')
def build_tensor():
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

# If there are 2 fields in data: Day and Hour such as in trafo example, build with this one.
@app.route('/build-tensor')
def build_tensor1():
    for elem in data:
        d = datetime.datetime.strptime(elem['DAY'], '%d-%m-%Y')
        month = datetime.datetime(d.year, d.month, 1)
        week = datetime.datetime(d.year, d.month, d.day)
        week -= datetime.timedelta(days=d.weekday())
        day = datetime.datetime(d.year, d.month, d.day)
        d = datetime.datetime.strptime(elem['HOUR'], '%H:%M:%S')
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

@app.route('/group-time/<interval>/<operation>/<op_field>')
def group_time_operate(interval, operation, op_field):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max', 'length']
    
    if not interval in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval"})

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_by_time_operate(interval, operation, op_field)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})    

@app.route('/group-time/<interval1>/<interval2>')
def group_time2(interval1, interval2):
    res = group_by_time2(interval1, interval2)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})    

@app.route('/group-time/<interval1>/<interval2>/<operation>/<op_field>')
def group_time_operate2(interval1, interval2, operation, op_field):
    intervals = ['hour', 'day', 'week', 'month']
    ops = ['sum', 'product', 'min', 'max', 'length']
    
    if not interval1 in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval1"})

    if not interval2 in intervals:
        return json.dumps({"status": "error", "error": "Invalid time interval2"})    

    if not operation in ops:
        return json.dumps({"status": "error", "error": "Invalid operation"})

    res = group_by_time_operate2(interval1, interval2, operation, op_field)

    if res is None:
        return json.dumps({"status": "error", "error": "Data processing error"})

    return json.dumps({"status": "ok", "result": res})    

# Groups by only 1 index of a time tensor.
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
        #print(date)
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
            groups[str(el)].append(elem[-1])
        else:
            groups[str(el)] = [elem[-1]]

    groups = collections.OrderedDict(sorted(groups.items(), key=lambda t: t[0]))

    return groups

# Groups by 1 index of a time tensor and does an operation over an index.
def group_by_time_operate(interval, operation, op_field):
    groups = group_by_time(interval)

    mappers = {
        'sum': sum, 
        'product': lambda a: reduce(lambda x, y: x * y, a), 
        'min': min, 
        'max': max,
        'length': lambda x: len(x),
        'id': lambda x: x
    }

    return { e: mappers[operation](map(lambda x: x[op_field], groups[e])) for e in groups } 

# Groups by 1 indices of a time tensor.
def group_by_time2(interval1, interval2):
    groups = {}

    intervals = { 
        'month': 0,
        'week': 1,
        'day': 2,
        'hour': 3
    }

    idx1 = intervals[interval1]
    idx2 = intervals[interval2]

    for elem in tens:

        date1 = elem[idx1]
        d1 = datetime.datetime.strptime(date1, '%Y-%m-%d %H:%M:%S')
        if interval1 == 'month':
            el1 = d1.month
        elif interval1 == 'week':
            el1 = datetime.datetime(d1.year, d1.month, d1.day)
        elif interval1 == 'day':
            el1 = d1.day
        elif interval1 == 'hour':
            el1 = d1.hour

        date2 = elem[idx2]
        d2 = datetime.datetime.strptime(date2, '%Y-%m-%d %H:%M:%S')
        if interval2 == 'month':
            el2 = d2.month
        elif interval2 == 'week':
            el2 = datetime.datetime(d2.year, d2.month, d2.day)
        elif interval2 == 'day':
            el2 = d1.day
        elif interval2 == 'hour':
            el2 = d1.hour

        k1 = str(el1)
        k2 = str(el2)

        if k1 in groups:
            if k2 in groups[k1]:
                groups[k1][k2].append(elem[-1])
            else:
                groups[k1][k2]=[elem[-1]]
        else:
            groups[k1]={}
            groups[k1][k2]=[elem[-1]]

    groups = collections.OrderedDict(sorted(groups.items(), key=lambda t: t[0]))

    return groups

# Groups by 2 indices of a time tensor.
def group_by_time_operate2(interval1, interval2, operation, op_field):
    groups = group_by_time2(interval1, interval2)

    mappers = {
        'sum': sum, 
        'product': lambda a: reduce(lambda x, y: x * y, a), 
        'min': min, 
        'max': max,
        'length': lambda x: len(x),
        'id': lambda x: x
    }

    return { e: { f: mappers[operation](map(lambda x: x[op_field], groups[e][f])) for f in groups[e]} for e in groups } 

app.run(debug=True)