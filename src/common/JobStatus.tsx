import React, {useEffect} from 'react'
import {message} from 'antd'
import {useInterval} from './hook-utils'
import {BuildJobState} from './build-job-state'

const MSG_KEY = 'job-status'

// FIXME: PM-2291 - remove when using i18n library
const maybePluralize = (count: number, noun: string, suffix = 's'): string =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`

export const JobStatus = (): JSX.Element => {
  const buildJobState = BuildJobState.useContainer()

  useInterval(() => {
    buildJobState.refresh()
  }, 5000)

  const numberOfJobs = Object.values(buildJobState.jobStatuses).length
  const numberOfBuildingJobs = Object.values(buildJobState.jobStatuses).filter(
    (j) => j.status === 'building',
  ).length

  useEffect(() => {
    if (numberOfBuildingJobs > 0) {
      message.loading({
        content: `Building ${maybePluralize(numberOfBuildingJobs, 'transaction')}`,
        key: MSG_KEY,
        duration: 0,
      })
    } else if (numberOfJobs > 0) {
      message.success({content: 'Finished', key: MSG_KEY, duration: 2})
    }
  }, [numberOfBuildingJobs])

  return <></>
}
