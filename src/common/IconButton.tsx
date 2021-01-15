import React from 'react'
import SVG from 'react-inlinesvg'
import {fillActionHandlers} from './util'
import './IconButton.scss'

type Icon =
  | 'arrow-down'
  | 'check-double'
  | 'check'
  | 'circle'
  | 'clock'
  | 'copy'
  | 'cross'
  | 'delete'
  | 'edit'
  | 'exchange'
  | 'hourglass'
  | 'loading'
  | 'refresh'
  | 'speed-high'
  | 'speed-low'
  | 'speed-medium'
  | 'sum'
  | 'wallet-restore'
  | 'wallet'

interface IconButtonProps {
  icon: Icon
  title?: string
  onClick: () => void
  width?: number
  height?: number
}

export const IconButton = ({
  icon,
  onClick,
  title,
  width = 16,
  height = 16,
}: IconButtonProps): JSX.Element => (
  <span className="iconContainer" data-testid={`${icon}-button`} {...fillActionHandlers(onClick)}>
    <SVG src={`icons/${icon}.svg`} className="icon" width={width} height={height} title={title} />
  </span>
)
