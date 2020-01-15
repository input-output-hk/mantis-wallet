import React from 'react'
import {InputProps} from 'antd/lib/input'
import {BorderlessInput} from '../../components/BorderlessInput'
import './WalletDialogInput.scss'

interface WalletDialogInputProps {
  label: string
}

export const WalletDialogInput: React.FunctionComponent<WalletDialogInputProps> = ({
  label,
}: InputProps & WalletDialogInputProps) => (
  <div className="WalletDialogInput">
    <div className="label">{label}</div>
    <BorderlessInput className="input" />
  </div>
)
