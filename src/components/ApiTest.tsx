import React, {useState} from 'react'
import {Button} from 'antd'
import {
  web3,
  SpendingKey,
  SeedPhrase,
  TransparentAddress,
  Account,
  SynchronizationStatus,
} from '../web3'
import {ThemeState} from '../theme-state'
import {WalletState} from '../common/wallet-state'
import {DialogInput} from '../common/dialog/DialogInput'

const wallet = web3.midnight.wallet

// FIXME: remove this component after every needed method is wired up with the real interface
export const ApiTest = (): JSX.Element => {
  const state = WalletState.useContainer()
  const themeState = ThemeState.useContainer()

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
      state.walletStatus === 'LOADED' ||
      state.walletStatus === 'ERROR' ||
      state.walletStatus === 'LOCKED' ||
      state.walletStatus === 'NO_WALLET'
    ) {
      state.reset()
    }

    setMessage('Loading...')

    fn()
      .then((result: unknown) => {
        console.log(result)
        setMessage(JSON.stringify(result, null, 2))
      })
      .catch((e: Error) => {
        console.error(e)
        setMessage(e.message)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TestButton = (props: any): JSX.Element => {
    return (
      <Button
        type="primary"
        style={{display: 'block', marginBottom: '0.5rem'}}
        onClick={call(props.onClick)}
      >
        {props.children}
      </Button>
    )
  }

  return (
    <div style={{margin: '4rem'}}>
      <h1>Api Test Interface</h1>

      <div style={{marginBottom: '1rem'}}>
        <h2>Settings</h2>
        <DialogInput
          label="Passphrase"
          value={passphrase}
          onChange={(e): void => setPassphrase(e.target.value)}
        />
        <DialogInput
          label="Spending Key"
          value={spendingKey}
          onChange={(e): void => setSpendingKey(e.target.value)}
        />
        <DialogInput
          label="Seed Phrase"
          value={seedPhrase}
          onChange={(e): void => setSeedPhrase(e.target.value)}
        />

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
          onClick={(): Promise<TransparentAddress> => wallet.generateTransparentAddress()}
        >
          Generate Transparent Address
        </TestButton>
        <TestButton
          onClick={(): Promise<boolean> => wallet.restoreFromSpendingKey({passphrase, spendingKey})}
        >
          Restore from Spending Key
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
          onClick={(): Promise<SynchronizationStatus> => wallet.getSynchronizationStatus()}
        >
          Sync Status
        </TestButton>
        <Button
          type="primary"
          style={{display: 'block', marginBottom: '0.5rem'}}
          onClick={() => themeState.switchTheme(themeState.theme === 'dark' ? 'light' : 'dark')}
        >
          Switch Theme
        </Button>
      </div>

      <div>
        <h2>Response</h2>
        <pre>{message}</pre>
      </div>
    </div>
  )
}
