import * as _ from "lodash";

export const min = (a: number, b: number) => (a < b ? a : b)
export const max = (a: number, b: number) => (a > b ? a : b)
export const partitionPivotFirst = (ar: number[]) => (_.partition(ar, (n: number) => n < ar[0]))
export const thing = 2;