/* eslint-disable @typescript-eslint/no-unused-vars */
import {Path, Diff, Filter} from '../../shared/typeUtils'

interface TestObj1Type {
  a: string
  b: {
    c: string
  }
}
interface TestObj2Type {
  a: string
  b: {
    c: string
    d: string
  }
}

// $ExpectType ["a"] | ["b", "c"]
type TestPathForObj1 = Path<TestObj1Type>

// $ExpectType ["a"] | ["b", "c"] | ["b", "d"]
type TestPathForObj2 = Path<TestObj2Type>

// $ExpectType TestObj1Type
type TestDiffForObj1Obj2 = Diff<TestObj1Type, TestObj2Type>

// $ExpectType never
type TestDiffForObj2Obj1 = Diff<TestObj2Type, TestObj1Type>

// $ExpectType never
type TestFilterForObj1Obj2 = Filter<TestObj1Type, TestObj2Type>

// $ExpectType TestObj2Type
type TestFilterForObj2Obj1 = Filter<TestObj2Type, TestObj1Type>
