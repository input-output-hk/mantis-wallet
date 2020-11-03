import React from 'react'
import SVG from 'react-inlinesvg'
import loadingIcon from '../assets/icons/loading.svg'
import './Loading.scss'

export const Loading = (): JSX.Element => {
  return (
    <div className="Loading">
      <SVG src={loadingIcon} className="svg loading-icon" />
    </div>
  )
}
