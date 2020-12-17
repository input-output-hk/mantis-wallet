import {assert} from 'chai'
import * as fc from 'fast-check'
import {BatchRange} from './BatchRange'

describe('BatchRange', () => {
  it('should clamp min to be greater or equal than 0 when creating with min and count', () => {
    fc.assert(
      fc.property(fc.integer(), fc.nat(), (min, size) => {
        const result = BatchRange.ofSize(min, size)

        assert(result.min >= 0)
      }),
    )
  })

  it('should clamp min to be greater or equal than 0 when creating with max and count', () => {
    fc.assert(
      fc.property(fc.integer(), fc.nat(), (max, size) => {
        const result = BatchRange.ofSizeFromMax(max, size)

        assert(result.min >= 0)
      }),
    )
  })
})
