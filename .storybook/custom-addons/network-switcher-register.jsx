import React, {useState} from 'react'
import {addons, types} from '@storybook/addons'
import {
  NETWORK_SWITCHER_ADDON_ID,
  NETWORK_SWITCHER_CHANGE,
} from '../../src/storybook-util/shared-constants.ts'
import {lightButtonStyle} from './styles'

const oppositeNetwork = (cur) => (cur === 'testnet' ? 'mainnet' : 'testnet')

const NetworkSwitch = ({api}) => {
  const [networkTag, setNetworkTag] = useState('testnet')

  const handleClick = (theme) => () => {
    setNetworkTag(theme)
    api.emit(NETWORK_SWITCHER_CHANGE, theme)
  }

  return (
    <span onClick={handleClick(oppositeNetwork(networkTag))} style={lightButtonStyle}>
      Switch to {oppositeNetwork(networkTag)}
    </span>
  )
}

addons.register(NETWORK_SWITCHER_ADDON_ID, (api) => {
  addons.add(NETWORK_SWITCHER_ADDON_ID, {
    title: 'NetworkTags',
    type: types.TOOL,
    match: ({viewMode}) => viewMode === 'story',
    render: () => <NetworkSwitch api={api} />,
  })
})
