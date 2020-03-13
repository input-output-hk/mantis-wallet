import React from 'react'
import {CHAINS, Chain} from '../pob/chains'
import {Token} from '../common/Token'
import {PeriodStatus} from './PeriodStatus'
import {ClaimRow} from './ClaimRow'
import './GlacierDropOverview.scss'
import BigNumber from 'bignumber.js'

export const availableChains: Chain[] = [CHAINS[2], CHAINS[0]]

interface BaseClaim {
  chain: Chain
  midnightAddress: string
  externalAddress: string
  dustAmount: BigNumber
  externalAmount: BigNumber
  unfrozenDustAmount: BigNumber
  withdrawnDustAmount: BigNumber
  unfrozen: boolean
}

interface SolvingClaim extends BaseClaim {
  puzzleStatus: 'solving'
  remainingSeconds: number
  unfrozen: false
}

interface UnsubmittedClaim extends BaseClaim {
  puzzleStatus: 'unsubmitted'
  unfrozen: false
}

interface SubmittedClaim extends BaseClaim {
  puzzleStatus: 'submitted'
}

export type Claim = SolvingClaim | UnsubmittedClaim | SubmittedClaim

const testClaims: Claim[] = [
  {
    puzzleStatus: 'solving',
    remainingSeconds: 12312,
    chain: availableChains[0],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: false,
  },
  {
    puzzleStatus: 'unsubmitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: false,
  },
  {
    puzzleStatus: 'submitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: false,
  },
  {
    puzzleStatus: 'submitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(0),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: true,
  },
  {
    puzzleStatus: 'submitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(1000012345678),
    withdrawnDustAmount: new BigNumber(0),
    unfrozen: true,
  },
  {
    puzzleStatus: 'submitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(10000123456789),
    withdrawnDustAmount: new BigNumber(1000012345678),
    unfrozen: true,
  },
  {
    puzzleStatus: 'submitted',
    chain: availableChains[1],
    midnightAddress: 'm-main-uns-ad1qqxcxcspxx8vdzv6va2qdypcy7q8gv5q2ut0mu',
    externalAddress: '0xDf7D7e053933b5cC24372f878c90E62dADAD5d42',
    dustAmount: new BigNumber(10000123456789),
    externalAmount: new BigNumber(20000123456789),
    unfrozenDustAmount: new BigNumber(10000123456789),
    withdrawnDustAmount: new BigNumber(10000123456789),
    unfrozen: true,
  },
]

export const GlacierDropOverview: React.FunctionComponent<{}> = () => {
  const chooseChain = (_chain: Chain): void => undefined
  const onWithdrawDust = (): void => undefined
  const onSubmitPuzzle = (): void => undefined
  const claims = testClaims

  return (
    <div className="GlacierDropOverview">
      <div className="main-title">Glacier Drop</div>
      <div className="content">
        <div className="wallet-selector"></div>
        <div className="claim-buttons">
          {availableChains.map((c: Chain) => (
            <Token chain={c} chooseChain={chooseChain} key={c.id}>
              Claim Dust
            </Token>
          ))}
        </div>
        <PeriodStatus />
        <div className="claim-history">
          <div className="title">
            <div className="main-title">Claim History</div>
            <div className="line"></div>
          </div>
          <div className="claims">
            {claims.map((c: Claim, i: number) => (
              <ClaimRow
                claim={c}
                index={i}
                key={i}
                onSubmitPuzzle={onSubmitPuzzle}
                onWithdrawDust={onWithdrawDust}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
