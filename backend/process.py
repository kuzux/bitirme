from __future__ import print_function

import csv
import sys
import datetime

infile = csv.DictReader(open(sys.argv[1]))

names = next(infile).keys()
names.append('time')
names.remove('DAY')
names.remove('HOUR')

outfile = csv.DictWriter(open(sys.argv[2], 'w'), fieldnames = names)

outfile.writeheader()
for row in infile:
    dt = datetime.datetime.strptime(row['DAY'] + " " + row['HOUR'],"%d-%m-%Y %H:%M:%S")

    del row['DAY']
    del row['HOUR']

    row['time'] = int((dt - datetime.datetime(1970, 1, 1)).total_seconds())
    outfile.writerow(row)
