import React, {PropsWithChildren, FunctionComponent} from 'react'
import './DialogColumns.scss'

export const DialogColumns: FunctionComponent<{}> = ({children}: PropsWithChildren<{}>) => (
  <div className="DialogColumns">{children}</div>
)
