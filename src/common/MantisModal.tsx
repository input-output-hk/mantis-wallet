import React, {useState, FunctionComponent, PropsWithChildren} from 'react'
import {CloseOutlined} from '@ant-design/icons'
import {Modal, message} from 'antd'
import {ModalProps} from 'antd/lib/modal'
import {EmptyProps} from 'antd/lib/empty'
import {createContainer} from 'unstated-next'
import {useTranslation} from './store/settings'
import './MantisModal.scss'

export type ModalOnCancel = Required<Pick<ModalProps, 'onCancel'>>

export interface ModalLocker {
  isLocked: boolean
  setLocked: (locked: boolean) => void
}

function useLocker(): ModalLocker {
  const [isLocked, setLocked] = useState(false)
  return {
    isLocked,
    setLocked,
  }
}

export const ModalLocker = createContainer(useLocker)

const _MantisModal: FunctionComponent<ModalProps> = ({onCancel, ...props}: ModalProps) => {
  const {t} = useTranslation()
  const locker = ModalLocker.useContainer()
  const onCancelWithLock = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    if (onCancel) {
      if (locker.isLocked) {
        message.warning(t(['common', 'message', 'waitUntilActionFinish']))
      } else {
        onCancel(e)
      }
    }
  }

  const closeIconStyle = locker.isLocked
    ? {
        opacity: 0.5,
        cursor: 'not-allowed',
      }
    : {}

  return (
    <Modal
      width={'auto'}
      footer={null}
      className="MantisModal"
      closeIcon={<CloseOutlined style={{fontSize: '24px', ...closeIconStyle}} />}
      centered
      destroyOnClose
      onCancel={onCancelWithLock}
      {...props}
    />
  )
}

export const MantisModal: FunctionComponent<ModalProps> = (props) => (
  <ModalLocker.Provider>
    <_MantisModal {...props} />
  </ModalLocker.Provider>
)

export function wrapWithModal<TProps extends object>(
  Component: FunctionComponent<TProps>,
  className?: string,
): FunctionComponent<TProps & ModalProps> {
  return function WrappedWithModal(props: TProps & ModalProps) {
    return (
      <MantisModal wrapClassName={className} {...props}>
        <Component {...props} />
      </MantisModal>
    )
  }
}

export const ScrollableModalFooter = ({children}: PropsWithChildren<EmptyProps>): JSX.Element => (
  <div className="ScrollableModalFooter">{children}</div>
)
