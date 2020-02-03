import React from 'react'

export const Unimplemented = (props: object): JSX.Element => {
  return (
    <div>
      <h1>Unimplemented</h1>
      <pre>{JSON.stringify(props, undefined, 2)}</pre>
    </div>
  )
}