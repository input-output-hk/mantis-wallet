import React from 'react'
import SVG from 'react-inlinesvg'
import './Loading.scss'

export const Loading = (): JSX.Element => {
  return (
    <div className="Loading">
      <SVG src="/icons/loading.svg" className="svg" />
    </div>
  )
}
