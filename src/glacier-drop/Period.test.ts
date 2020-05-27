import {assert} from 'chai'
import {PeriodConfig} from './glacier-state'
import {getCurrentEpoch} from './Period'

jest.mock('../config/renderer.ts')

const periodConfig: PeriodConfig = {
  unlockingStartBlock: 100,
  unlockingEndBlock: 200,
  unfreezingStartBlock: 300,
  numberOfEpochs: 10,
  epochLength: 10,
}

it('validates amount correctly', () => {
  // Unfreezing not started
  assert.equal(getCurrentEpoch(0, periodConfig), 0)
  assert.equal(getCurrentEpoch(50, periodConfig), 0)
  assert.equal(getCurrentEpoch(100, periodConfig), 0)
  assert.equal(getCurrentEpoch(150, periodConfig), 0)
  assert.equal(getCurrentEpoch(200, periodConfig), 0)
  assert.equal(getCurrentEpoch(299, periodConfig), 0)

  // First epoch
  assert.equal(getCurrentEpoch(300, periodConfig), 1)
  assert.equal(getCurrentEpoch(309, periodConfig), 1)

  // Second epoch
  assert.equal(getCurrentEpoch(310, periodConfig), 2)
  assert.equal(getCurrentEpoch(319, periodConfig), 2)

  // Tenth epoch
  assert.equal(getCurrentEpoch(400, periodConfig), 10)
  assert.equal(getCurrentEpoch(10000, periodConfig), 10)
})
