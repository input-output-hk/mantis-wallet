import React, {useEffect} from 'react'
import {message} from 'antd'
import {useInterval} from './hook-utils'
import {BuildJobState} from './build-job-state'

// FIXME: remove when using i18n library
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
        key: 'job-status',
        duration: 0,
      })
    } else if (numberOfJobs > 0) {
      message.success({content: 'Finished', key: 'job-status', duration: 2})
    }
  }, [numberOfBuildingJobs])

  return <></>
}
