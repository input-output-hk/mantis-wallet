import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render} from '@testing-library/react'
import {range} from 'lodash'
import BigNumber from 'bignumber.js'
import {DUMMY_PERIOD_CONFIG} from '../storybook-util/dummies'
import {Epochs, EpochRow} from './Epochs'
import {WithSettingsProvider} from '../common/test-helpers'

const EPOCH_ROWS: EpochRow[] = [
  {
    transparentAddress: 'm-main-uns-ABCDjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk',
    dustAmount: new BigNumber(9876543219876543212),
    numberOfEpochs: 10,
  },
  {
    transparentAddress: 'm-main-uns-DEFGjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk',
    dustAmount: new BigNumber(6789876789876),
    numberOfEpochs: 3,
  },
]

test('Epochs', async () => {
  const {getByText} = render(
    <Epochs visible epochRows={EPOCH_ROWS} periodConfig={DUMMY_PERIOD_CONFIG} currentBlock={320} />,
    {wrapper: WithSettingsProvider},
  )

  // Transparent addresses are shown
  EPOCH_ROWS.map((r: EpochRow) => expect(getByText(r.transparentAddress)).toBeInTheDocument())

  // Epoch labels are shown
  range(1, DUMMY_PERIOD_CONFIG.numberOfEpochs + 1).map((i) =>
    expect(getByText(`Epoch ${i}`)).toBeInTheDocument(),
  )

  // Remaining time is shown
  expect(getByText('Epoch 3 finishes in 7 minutes')).toBeInTheDocument()
})
