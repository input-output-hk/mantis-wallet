import React, {useEffect} from 'react'
import {message} from 'antd'
import {useInterval} from './hook-utils'
import {BuildJobState} from './build-job-state'
import {useTranslation} from '../settings-state'

const MSG_KEY = 'job-status'

export const JobStatus = (): JSX.Element => {
  const buildJobState = BuildJobState.useContainer()
  const {t} = useTranslation()

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
        content: t(['wallet', 'buildTxStatus', 'buildingTransaction'], {
          count: numberOfBuildingJobs,
        }),
        key: MSG_KEY,
        duration: 0,
      })
    } else if (numberOfJobs > 0) {
      message.success({
        content: t(['wallet', 'buildTxStatus', 'finishedTxBuilding']),
        key: MSG_KEY,
        duration: 2,
      })
    }
  }, [numberOfBuildingJobs])

  return <></>
}
