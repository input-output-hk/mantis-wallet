import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {
  getCurrentEpoch,
  getSecondsUntilNextEpoch,
  getCurrentPeriod,
  getUnfrozenAmount,
} from './Period'
import {BLOCK_TIME_SECONDS} from './glacier-config'
import {DUMMY_PERIOD_CONFIG} from '../storybook-util/dummies'

jest.mock('../config/renderer.ts')

it('validates amount correctly', () => {
  // Unfreezing not started
  assert.equal(getCurrentEpoch(0, DUMMY_PERIOD_CONFIG), 0)
  assert.equal(getCurrentEpoch(50, DUMMY_PERIOD_CONFIG), 0)
  assert.equal(getCurrentEpoch(100, DUMMY_PERIOD_CONFIG), 0)
  assert.equal(getCurrentEpoch(150, DUMMY_PERIOD_CONFIG), 0)
  assert.equal(getCurrentEpoch(200, DUMMY_PERIOD_CONFIG), 0)
  assert.equal(getCurrentEpoch(299, DUMMY_PERIOD_CONFIG), 0)

  // First epoch
  assert.equal(getCurrentEpoch(300, DUMMY_PERIOD_CONFIG), 1)
  assert.equal(getCurrentEpoch(309, DUMMY_PERIOD_CONFIG), 1)

  // Second epoch
  assert.equal(getCurrentEpoch(310, DUMMY_PERIOD_CONFIG), 2)
  assert.equal(getCurrentEpoch(319, DUMMY_PERIOD_CONFIG), 2)

  // Tenth epoch
  assert.equal(getCurrentEpoch(400, DUMMY_PERIOD_CONFIG), 10)
  assert.equal(getCurrentEpoch(10000, DUMMY_PERIOD_CONFIG), 10)
})

it('calculates seconds until next epoch correctly', () => {
  assert.equal(getSecondsUntilNextEpoch(300, DUMMY_PERIOD_CONFIG), BLOCK_TIME_SECONDS * 10)
  assert.equal(getSecondsUntilNextEpoch(308, DUMMY_PERIOD_CONFIG), BLOCK_TIME_SECONDS * 2)
  assert.equal(getSecondsUntilNextEpoch(358, DUMMY_PERIOD_CONFIG), BLOCK_TIME_SECONDS * 2)
})

it('determines period correctly', () => {
  assert.equal(getCurrentPeriod(99, DUMMY_PERIOD_CONFIG), 'UnlockingNotStarted')
  assert.equal(getCurrentPeriod(100, DUMMY_PERIOD_CONFIG), 'Unlocking')
  assert.equal(getCurrentPeriod(199, DUMMY_PERIOD_CONFIG), 'Unlocking')
  assert.equal(getCurrentPeriod(200, DUMMY_PERIOD_CONFIG), 'UnlockingEnded')
  assert.equal(getCurrentPeriod(299, DUMMY_PERIOD_CONFIG), 'UnlockingEnded')
  assert.equal(getCurrentPeriod(300, DUMMY_PERIOD_CONFIG), 'Unfreezing')
})

it('calculates unfrozen amount correctly', () => {
  const dustAmount = new BigNumber(100)
  assert.deepEqual(getUnfrozenAmount(dustAmount, 1, 10, false), new BigNumber(0))
  assert.deepEqual(getUnfrozenAmount(dustAmount, 1, 10, true), new BigNumber(10))
  assert.deepEqual(getUnfrozenAmount(dustAmount, 2, 10, true), new BigNumber(20))
  assert.deepEqual(getUnfrozenAmount(dustAmount, 10, 10, true), new BigNumber(100))
  assert.deepEqual(getUnfrozenAmount(dustAmount, 1, 5, true), new BigNumber(20))
  assert.deepEqual(getUnfrozenAmount(dustAmount, 1, 2, true), new BigNumber(50))
})
