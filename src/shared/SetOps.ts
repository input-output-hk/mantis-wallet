import {Eq} from 'fp-ts/Eq'
import {set} from 'fp-ts'

export const intersectionAndDiffs = <T>(
  eq: Eq<T>,
  a: Set<T>,
  b: Set<T>,
): {aOnly: Set<T>; common: Set<T>; bOnly: Set<T>} => {
  const aOnly = new Set<T>()
  const bOnly = new Set<T>()
  const common = new Set<T>()

  a.forEach((aItem) => {
    if (set.elem(eq)(aItem, b)) {
      common.add(aItem)
    } else {
      aOnly.add(aItem)
    }
  })
  b.forEach((bItem) => {
    if (!set.elem(eq)(bItem, common)) {
      bOnly.add(bItem)
    }
  })

  return {aOnly, bOnly, common}
}
