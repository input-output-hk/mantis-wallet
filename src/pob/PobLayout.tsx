import React, {FunctionComponent, PropsWithChildren} from 'react'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {LINKS} from '../external-link-config'
import {BackendState} from '../common/backend-state'
import {isTestnet} from '../shared/version'
import {useTranslation} from '../settings-state'
import {Trans} from '../common/Trans'
import './PobLayout.scss'

interface PobLayoutProps {
  title: string
}

const TestnetWarning = (): JSX.Element => (
  <div className="warning">
    <div className="warning-content">
      <Trans k={['proofOfBurn', 'message', 'testnetWarning']} />
    </div>
  </div>
)

export const PobLayout: FunctionComponent<PobLayoutProps> = ({
  title,
  children,
}: PropsWithChildren<PobLayoutProps>) => {
  const {networkTag} = BackendState.useContainer()
  const {t} = useTranslation()

  return (
    <div className="PobLayout">
      {isTestnet(networkTag) && <TestnetWarning />}
      <HeaderWithSyncStatus
        externalLink={{text: t(['proofOfBurn', 'link', 'learnMoreAboutPoB']), url: LINKS.aboutPoB}}
      >
        {title}
      </HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}
