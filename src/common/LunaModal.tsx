import React from 'react'
import {Modal, Icon} from 'antd'
import {ModalProps} from 'antd/lib/modal'
import './LunaModal.scss'

export const LunaModal: React.FunctionComponent<ModalProps> = (props) => (
  <Modal
    width={636}
    footer={null}
    className="LunaModal"
    closeIcon={<Icon type="close" style={{fontSize: '40px'}} />}
    {...props}
  />
)
