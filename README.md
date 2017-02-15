# bitirme

cmpe492 capstone project. Visualization of multivariate data

# api 

/group-by/{interval}/{operation}

group by time interval performing an operation.

interval => hour, day, week, month. 

operation => sum, product, min, max.

returns the aggregated data in a similar format to how it is uploaded.

/upload

upload data in a json format. as a list of objects which all have a date column as a unix timestamp

/raw

returns the uploaded data in a raw json format
