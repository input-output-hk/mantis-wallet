import React from 'react'
import {Trans as TransNext, TransProps as TransPropsNext} from 'react-i18next'
import {TKeyRenderer, tKeyRendererToString} from './i18n'
import {useTranslation} from '../settings-state'

type TransProps = Omit<TransPropsNext<string>, 'i18nKey' | 'i18n'> & {
  k: TKeyRenderer
}

export const Trans = ({k, ...props}: TransProps): JSX.Element => {
  const {i18n} = useTranslation()

  return <TransNext i18nKey={tKeyRendererToString(k)} i18n={i18n} {...props} />
}
