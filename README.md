# bitirme

cmpe492 capstone project. Visualization of multivariate data

# api 

/

returns the contents of this file

/hello

test call. returns a simple string. might be useful to check whether the service is up

/group-by/{field}

groups by a non-time field returning the folded tensor

/group-by-time/{interval} (OR /group-time/{interval} for COO representation)

groups by the time field specifying an interval

/group-time/{interval1}/{interval2} for COO representation

groups by two time fields specifying intervals

/group-by/{field}/{operation}/{op-field} 

groups by non-time field performing an operation.

op-field => which field to perform the operation on

/group-by-time/{interval}/{operation}/ (OR /group-time/{interval}/{operation}/{op_field} for COO representation)

group by time interval performing an operation.

interval => hour, day, week, month. 

operation => sum, product, min, max, length

returns the aggregated data in a similar format to how it is uploaded.

/group-time/{interval1}/{interval2}/{operation}/{op_field} for COO representation

groups by two time intervals and perform an operation on op_field.

/upload

uploads data in a json format. as a list of objects which all have a date column as a unix timestamp

/upload/csv

uploads data in csv format. 

/upload/csv1

uploads data in csv format, the namefields for data is specified for the trafo example.

/raw

returns the uploaded data in a raw json format

/build-tensor

builds a time tensor in coordinate list sparse matrix format. (https://en.wikipedia.org/wiki/Sparse_matrix#Coordinate_list_.28COO.29) There must be a timestamp value to be able to use this.

/build-tensor1

this one does the same job with build-tensor but it takes 2 arguments as time values -> 'DAY' and 'HOUR'

/raw-tensor

returns the data represented as time tensor in a raw json format.


