import React, {useState} from 'react'
import {addons, types} from '@storybook/addons'
import {
  NETWORK_SWITCHER_ADDON_ID,
  NETWORK_SWITCHER_CHANGE,
} from '../../src/storybook-util/shared-constants.ts'
import {lightButtonStyle} from './styles'

const oppositeNetwork = (cur) => (cur === 'private' ? 'main' : 'private')

const NetworkSwitch = ({api}) => {
  const [networkType, setNetworkType] = useState('private')

  const handleClick = (theme) => () => {
    setNetworkType(theme)
    api.emit(NETWORK_SWITCHER_CHANGE, theme)
  }

  return (
    <span onClick={handleClick(oppositeNetwork(networkType))} style={lightButtonStyle}>
      Switch to {oppositeNetwork(networkType)}
    </span>
  )
}

addons.register(NETWORK_SWITCHER_ADDON_ID, (api) => {
  addons.add(NETWORK_SWITCHER_ADDON_ID, {
    title: 'NetworkTypes',
    type: types.TOOL,
    match: ({viewMode}) => viewMode === 'story',
    render: () => <NetworkSwitch api={api} />,
  })
})
