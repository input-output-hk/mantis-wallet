export enum TransactionType {
  basic = 'BASIC',
  advanced = 'ADVANCED',
}

export interface BasicTransactionParams {
  amount: string
  fee: string
  recipient: string
}

export interface AdvancedTransactionParams {
  amount: string
  gasLimit: string
  gasPrice: string
  recipient: string
  data: string
  nonce: string
}
