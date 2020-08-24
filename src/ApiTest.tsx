import React, {useState} from 'react'
import {Button, Switch} from 'antd'
import {
  makeWeb3Worker,
  SpendingKey,
  SeedPhrase,
  TransparentAddress,
  Account,
  RawSynchronizationStatus,
  PrivateAddress,
} from './web3'
import {getContractConfigs} from './config/renderer'
import {WalletState} from './common/wallet-state'
import {GlacierState} from './glacier-drop/glacier-state'
import {SettingsState} from './settings-state'
import {BorderlessInput} from './common/BorderlessInput'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {rendererLog} from './common/logger'
import './ApiTest.scss'

const web3 = makeWeb3Worker()
const wallet = web3.midnight.wallet

// FIXME: remove this component after every needed method is wired up with the real interface
export const ApiTest = (): JSX.Element => {
  const walletState = WalletState.useContainer()
  const glacierState = GlacierState.useContainer()
  const settingState = SettingsState.useContainer()

  const contractAddresses = getContractConfigs()
  const networks = Object.keys(contractAddresses)
  const selectedNetworkIndex = networks.indexOf(glacierState.selectedNetwork)

  const [message, setMessage] = useState<string>('')

  const [passphrase, setPassphrase] = useState<string>('Foobar1234')
  const [spendingKey, setSpendingKey] = useState<string>(
    'm-test-shl-sk1fj335eanpmupaj9vx5879t7ljfnh7xct486rqgwxw8evwp2qkaksmcqu88',
  )
  const [seedPhrase, setSeedPhrase] = useState<string>(
    'pencil ensure regular job joy witness dutch rain minimum wealth estate leopard',
  )

  const call = (fn: CallableFunction) => (): void => {
    if (
      walletState.walletStatus === 'LOADED' ||
      walletState.walletStatus === 'ERROR' ||
      walletState.walletStatus === 'LOCKED' ||
      walletState.walletStatus === 'NO_WALLET'
    ) {
      walletState.reset()
    }

    setMessage('Loading...')

    fn()
      .then((result: unknown) => {
        rendererLog.info(result)
        setMessage(JSON.stringify(result, null, 2))
      })
      .catch((e: Error) => {
        rendererLog.error(e)
        setMessage(e.message)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TestButton = (props: any): JSX.Element => {
    return (
      <Button
        type="primary"
        style={{display: 'inline-block', margin: '0 0.5rem 0.5rem 0'}}
        onClick={call(props.onClick)}
      >
        {props.children}
      </Button>
    )
  }

  return (
    <div className="ApiTest">
      <div className="main-title" style={{marginBottom: '1em'}}>
        Api Test Interface
      </div>

      <div style={{marginBottom: '1rem'}}>
        <h2>Settings</h2>
        <div className="input">
          <div className="label">Pseudo language</div>
          <Switch
            aria-label="Pseudo language"
            checked={settingState.isPseudoLanguageUsed}
            onChange={settingState.usePseudoLanguage}
          />
        </div>
        <div className="input">
          <label htmlFor="passphrase">Passphrase</label>
          <BorderlessInput
            id="passphrase"
            value={passphrase}
            onChange={(e): void => setPassphrase(e.target.value)}
          />
        </div>
        <div className="input">
          <label htmlFor="private-key">Private Key</label>
          <BorderlessInput
            id="private-key"
            value={spendingKey}
            onChange={(e): void => setSpendingKey(e.target.value)}
          />
        </div>
        <div className="input">
          <label htmlFor="seed-phrase">Seed Phrase</label>
          <BorderlessInput
            id="seed-phrase"
            value={seedPhrase}
            onChange={(e): void => setSeedPhrase(e.target.value)}
          />
        </div>

        {networks.length > 1 && (
          <div>
            <DialogDropdown
              label="Selected Network"
              options={networks}
              defaultOptionIndex={selectedNetworkIndex}
              onChange={glacierState.updateSelectedNetwork}
            />
          </div>
        )}

        <h2>Actions</h2>
        <TestButton onClick={(): Promise<SpendingKey & SeedPhrase> => wallet.create({passphrase})}>
          Create
        </TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.remove({passphrase})}>
          Remove
        </TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.lock({passphrase})}>Lock</TestButton>
        <TestButton onClick={(): Promise<boolean> => wallet.unlock({passphrase})}>
          Unlock
        </TestButton>
        <TestButton
          onClick={(): Promise<TransparentAddress> => wallet.generateTransparentAccount()}
        >
          Generate Transparent Account
        </TestButton>
        <TestButton onClick={(): Promise<PrivateAddress> => wallet.generatePrivateAccount()}>
          Generate Confidential Account
        </TestButton>
        <TestButton
          onClick={(): Promise<boolean> => wallet.restoreFromSpendingKey({passphrase, spendingKey})}
        >
          Restore from Private Key
        </TestButton>
        <TestButton
          onClick={(): Promise<boolean> =>
            wallet.restoreFromSeedPhrase({passphrase, seedPhrase: seedPhrase.split(' ')})
          }
        >
          Restore from Seed Phrase
        </TestButton>
        <TestButton onClick={(): Promise<Account[]> => wallet.listAccounts()}>Accounts</TestButton>
        <TestButton
          onClick={(): Promise<RawSynchronizationStatus> => wallet.getSynchronizationStatus()}
        >
          Sync Status
        </TestButton>
        <TestButton onClick={(): Promise<void> => glacierState.removeClaims()}>
          Remove Claims
        </TestButton>
      </div>

      <div>
        <h2>Response</h2>
        <pre>{message}</pre>
      </div>
    </div>
  )
}
