import {assert} from 'chai'
import _ from 'lodash'
import {CHAINS} from './chains'

it('guards chains have correct id', () => {
  _.toPairs(CHAINS).forEach(([mapKey, {id}]) => assert.equal(mapKey, id))
})
