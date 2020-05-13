export type Diff<T, U> = T extends U ? never : T //Remove types from T that are assignable to U
export type Filter<T, U> = T extends U ? T : never // Remove types from T that are not assignable to U
