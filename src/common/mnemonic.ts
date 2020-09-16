import {generateMnemonic, mnemonicToSeed, validateMnemonic} from 'bip39'
import {hdkey} from 'ethereumjs-wallet'
import {createTErrorRenderer} from './i18n'

interface RecoverySecrets {
  seedPhrase: string[]
  privateKey: string
}

export async function generatePrivateKeyFromSeedPhrase(seedPhrase: string): Promise<string> {
  if (!validateMnemonic(seedPhrase)) {
    throw createTErrorRenderer(['common', 'error', 'invalidSeedPhrase'])
  }

  const seed = await mnemonicToSeed(seedPhrase)

  return hdkey
    .fromMasterSeed(seed)
    .derivePath("m/44'/60'/0/0/0")
    .getWallet()
    .getPrivateKeyString()
}

export async function createNewAccount(): Promise<RecoverySecrets> {
  const mnemonic = generateMnemonic()

  const privateKey = await generatePrivateKeyFromSeedPhrase(mnemonic)

  return {
    seedPhrase: mnemonic.split(' '),
    privateKey,
  }
}
