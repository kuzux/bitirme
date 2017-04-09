# bitirme

cmpe492 capstone project. Visualization of multivariate data

# api 

/

returns the contents of this file

/hello

test call. returns a simple string. might be useful to check whether the service is up

/group-by/{field}

group by a non-time field returning the folded tensor

/group-by-time/{interval} (OR /group-time/{interval} for LIL representation)

group by the time field specifying an interval

/group-time/{interval1}/{interval2} for LIL representation

group by two time fields specifying intervals

/group-by/{field}/{operation}/{op-field} 

group by non-time field performing an operation.

op-field => which field to perform the operation on

/group-by-time/{interval}/{operation}/ (OR /group-time/{interval}/{operation}/{op_field} for LIL representation)

group by time interval performing an operation.

interval => hour, day, week, month. 

operation => sum, product, min, max, length

returns the aggregated data in a similar format to how it is uploaded.

/group-time/{interval1}/{interval2}/{operation}/{op_field} for LIL representation

group by two time intervals and perform an operation on op_field.

/upload

upload data in a json format. as a list of objects which all have a date column as a unix timestamp

/raw

returns the uploaded data in a raw json format

/build-tensor

builds a time tensor in list of lists sparse matrix format. (https://en.wikipedia.org/wiki/Sparse_matrix#List_of_lists_.28LIL.29) There must be a timestamp value to be able to use this.

/build-tensor1

this one does the same job with build-tensor but it takes 2 arguments as time values -> 'DAY' and 'HOUR'

/raw-tensor

returns the data represented as time tensor in a raw json format.


