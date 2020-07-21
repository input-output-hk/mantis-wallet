import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render} from '@testing-library/react'
import {DUMMY_PERIOD_CONFIG} from '../storybook-util/dummies'
import {PeriodStatus} from './PeriodStatus'
import {WithSettingsProvider} from '../common/test-helpers'

test('PeriodStatus: Unlocking not yet started', async () => {
  const {getByText} = render(
    <PeriodStatus periodConfig={DUMMY_PERIOD_CONFIG} currentBlock={99} powPuzzleComplete={false} />,
    {wrapper: WithSettingsProvider},
  )

  expect(getByText('Unlocking not yet started')).toBeInTheDocument()
  expect(getByText('Less than a minute until Unlocking starts')).toBeInTheDocument()
})

test('PeriodStatus: Unlocking Period in Progress', async () => {
  const {getByText} = render(
    <PeriodStatus
      periodConfig={DUMMY_PERIOD_CONFIG}
      currentBlock={100}
      powPuzzleComplete={false}
    />,
    {wrapper: WithSettingsProvider},
  )

  expect(getByText('Unlocking Period in Progress')).toBeInTheDocument()
  expect(getByText('About 1 hour left to unlock Dust')).toBeInTheDocument()
  expect(getByText('Unfreezing Period starts in about 2 hours')).toBeInTheDocument()
})

test('PeriodStatus: PoW puzzle complete', async () => {
  const {getByText} = render(
    <PeriodStatus periodConfig={DUMMY_PERIOD_CONFIG} currentBlock={100} powPuzzleComplete={true} />,
    {wrapper: WithSettingsProvider},
  )

  expect(getByText('PoW Puzzle Complete')).toBeInTheDocument()
  expect(
    getByText('You have about 1 hour to submit your Proof of Unlock for Glacier Drop'),
  ).toBeInTheDocument()
})

test('PeriodStatus: Unlocking Period Ended', async () => {
  const {getByText} = render(
    <PeriodStatus
      periodConfig={DUMMY_PERIOD_CONFIG}
      currentBlock={200}
      powPuzzleComplete={false}
    />,
    {wrapper: WithSettingsProvider},
  )

  expect(getByText('Unlocking Period Ended')).toBeInTheDocument()
  expect(getByText('About 1 hour until Unfreezing')).toBeInTheDocument()
})

test('PeriodStatus: PoW Puzzle Complete not shown when unlocking period ended', async () => {
  const {queryByText} = render(
    <PeriodStatus periodConfig={DUMMY_PERIOD_CONFIG} currentBlock={200} powPuzzleComplete={true} />,
    {wrapper: WithSettingsProvider},
  )

  expect(queryByText('PoW Puzzle Complete')).not.toBeInTheDocument()
})

test('PeriodStatus: Unfreezing Period in Progress', async () => {
  const {getByText} = render(
    <PeriodStatus
      periodConfig={DUMMY_PERIOD_CONFIG}
      currentBlock={300}
      powPuzzleComplete={false}
    />,
    {wrapper: WithSettingsProvider},
  )

  expect(getByText('Unfreezing Period in Progress')).toBeInTheDocument()
})
