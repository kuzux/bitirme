# bitirme

cmpe492 capstone project. Visualization of multivariate data

# api 

/

returns the contents of this file

/hello

test call. returns a simple string. might be useful to check whether the service is up

/group-by/{field}

group by a non-time field returning the folded tensor

/group-by-time/{interval}

group by the time field specifying an interval

/group-by/{field}/{operation}/{op-field} 

group by non-time field performing an operation.

op-field => which field to perform the operation on

/group-by-time/{interval}/{operation}/

group by time interval performing an operation.

interval => hour, day, week, month. 

operation => sum, product, min, max, length

returns the aggregated data in a similar format to how it is uploaded.

/upload

upload data in a json format. as a list of objects which all have a date column as a unix timestamp

/raw

returns the uploaded data in a raw json format
