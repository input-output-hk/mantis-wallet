import {assert} from 'chai'
import _ from 'lodash'
import {POB_CHAINS} from './pob-chains'

it('guards chains have correct id', () => {
  _.toPairs(POB_CHAINS).forEach(([mapKey, {id}]) => assert.equal(mapKey, id))
})
