import React from 'react'

export default function InlineSVG(props: {title: string}): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg">
      <title>{props.title}</title>
    </svg>
  )
}
