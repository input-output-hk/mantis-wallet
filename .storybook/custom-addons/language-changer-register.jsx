import React, {useState} from 'react'
import {addons, types} from '@storybook/addons'
import {
  LANGUAGE_CHANGER_ADDON_ID,
  LANGUAGE_CHANGER_PSEUDO_SWITCH,
} from '../../src/storybook-util/shared-constants.ts'
import {lightButtonStyle} from './styles'

const LanguageChanger = ({ api }) => {
  const [isPseudoLanguageUsed, usePseudoLanguage] = useState(false)

  const handleClick = (isPseudo) => () => {
    usePseudoLanguage(isPseudo)
    api.emit(LANGUAGE_CHANGER_PSEUDO_SWITCH, isPseudo)
  }

  return (
    <span onClick={handleClick(!isPseudoLanguageUsed)} style={lightButtonStyle}>
      Switch to {isPseudoLanguageUsed ? 'Normal Language' : 'Pseudo Language'}
    </span>
  )
}

addons.register(LANGUAGE_CHANGER_ADDON_ID, (api) => {
  addons.add(LANGUAGE_CHANGER_PSEUDO_SWITCH, {
    title: 'Language',
    type: types.TOOL,
    match: ({viewMode}) => viewMode === 'story',
    render: () => <LanguageChanger api={api} />,
  })
})
