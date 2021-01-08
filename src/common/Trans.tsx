import React from 'react'
import {Trans as TransNext} from 'react-i18next'
import {TKeyRenderer, tKeyRendererToString} from './i18n'
import {useTranslation} from './store/settings'

interface TransProps extends Omit<Parameters<typeof TransNext>[0], 'i18nKey' | 'i18n'> {
  k: TKeyRenderer
}

export const Trans = ({k, ...props}: TransProps): JSX.Element => {
  const {i18n} = useTranslation()

  return <TransNext i18nKey={tKeyRendererToString(k)} i18n={i18n} {...props} />
}
