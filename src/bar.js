import _ from "lodash";

export const min = (a, b) => (a < b ? a : b)
export const max = (a, b) => (a > b ? a : b)
export const partitionPivotFirst = (ar) => (_.partition(ar, n => n < ar[0]))