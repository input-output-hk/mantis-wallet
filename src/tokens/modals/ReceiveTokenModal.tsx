import React, {FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal, ScrollableModalFooter} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {useLocalizedUtilities, useFormatters} from '../../settings-state'
import {CopyableLongText} from '../../common/CopyableLongText'
import {Trans} from '../../common/Trans'
import {Account} from '../../common/wallet-state'
import {Token} from '../tokens-state'
import {DialogInput} from '../../common/dialog/DialogInput'
import {formatTokenAmount} from '../tokens-utils'
import './ReceiveTokenModal.scss'

interface ReceiveTokenDialogProps {
  token: Token
  newestAccount?: Account
}

interface ReceiveTokenModalProps {
  token: Token
  accounts: Account[]
}

const ReceiveTokenDialog: FunctionComponent<ReceiveTokenDialogProps> = ({
  token,
  newestAccount,
}: ReceiveTokenDialogProps) => {
  const {abbreviateAmount} = useFormatters()
  const {copyToClipboard} = useLocalizedUtilities()

  const availableBalance = newestAccount?.tokens[token.address] ?? new BigNumber(0)

  const title = newestAccount ? (
    <Trans k={['wallet', 'title', 'receiveAccount']} values={{index: newestAccount.index}} />
  ) : (
    <Trans k={['wallet', 'message', 'noKnownAddresses']} />
  )

  return (
    <Dialog
      leftButtonProps={{
        children: <Trans k={['wallet', 'button', 'copyAddress']} />,
        autoFocus: true,
        onClick: async (): Promise<void> => {
          if (newestAccount) {
            await copyToClipboard(newestAccount.address)
          }
        },
        disabled: !newestAccount,
      }}
      rightButtonProps={{doNotRender: true}}
      type="dark"
    >
      <div className="title">{title}</div>
      {newestAccount && (
        <>
          <DialogInput
            disabled
            label={<Trans k={['tokens', 'label', 'balance']} />}
            value={formatTokenAmount(abbreviateAmount, token, availableBalance)}
          />
          <DialogQRCode content={newestAccount.address} />
        </>
      )}
    </Dialog>
  )
}

export const ReceiveTokenModal: FunctionComponent<ReceiveTokenModalProps & ModalProps> = ({
  token,
  accounts,
  ...props
}: ReceiveTokenModalProps & ModalProps) => {
  const {abbreviateAmount} = useFormatters()

  const newestAccount = _.head(accounts)

  // Address List Component
  const usedAddresses = accounts && accounts.length > 1 && (
    <ScrollableModalFooter>
      <div className="footer">
        <div className="title">
          <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
        </div>
        {accounts.slice(1).map(({address, tokens}) => (
          <div key={address} className="account">
            <CopyableLongText content={address} className="address" showQrCode />
            {' - '}
            <span>
              {formatTokenAmount(
                abbreviateAmount,
                token,
                tokens[token.address] ?? new BigNumber(0),
              )}
            </span>
          </div>
        ))}
      </div>
    </ScrollableModalFooter>
  )

  return (
    <LunaModal footer={usedAddresses} wrapClassName="ReceiveTokenModal" {...props}>
      <ReceiveTokenDialog token={token} newestAccount={newestAccount} />
    </LunaModal>
  )
}
