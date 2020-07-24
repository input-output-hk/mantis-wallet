import React, {useState, FunctionComponent} from 'react'
import {CloseOutlined} from '@ant-design/icons'
import {Modal, message} from 'antd'
import {ModalProps} from 'antd/lib/modal'
import {createContainer} from 'unstated-next'
import {useTranslation} from '../settings-state'
import './LunaModal.scss'

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

const _LunaModal: FunctionComponent<ModalProps> = ({onCancel, ...props}: ModalProps) => {
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
      className="LunaModal"
      closeIcon={<CloseOutlined style={{fontSize: '24px', ...closeIconStyle}} />}
      centered
      destroyOnClose
      onCancel={onCancelWithLock}
      {...props}
    />
  )
}

export const LunaModal: FunctionComponent<ModalProps> = (props) => (
  <ModalLocker.Provider>
    <_LunaModal {...props} />
  </ModalLocker.Provider>
)

export const wrapWithModal = <TProps extends object>(
  Component: FunctionComponent<TProps>,
  className?: string,
): FunctionComponent<TProps & ModalProps> => (props: TProps & ModalProps) => {
  return (
    <LunaModal wrapClassName={className} {...props}>
      <Component {...props} />
    </LunaModal>
  )
}
