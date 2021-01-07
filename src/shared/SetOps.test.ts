import * as fc from 'fast-check'
import {eq, set} from 'fp-ts'
import {intersectionAndDiffs} from './SetOps'

describe('SetOps', () => {
  describe('intersectionsAndDiffs', () => {
    it('calculates sets for given A and B: A\\B, B\\A, A⋂B', () => {
      fc.assert(
        fc.property(
          fc.set(fc.string()).map((s) => new Set(s)),
          fc.set(fc.string()).map((s) => new Set(s)),
          (a, b) => {
            const {aOnly, bOnly, common} = intersectionAndDiffs(eq.eqString, a, b)

            expect(aOnly).toEqual(set.difference(eq.eqString)(a, b))
            expect(bOnly).toEqual(set.difference(eq.eqString)(b, a))
            expect(common).toEqual(set.intersection(eq.eqString)(a, b))
          },
        ),
      )
    })
  })
})
