import React, {useState, useRef, useEffect, FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {Input, Button, Popover} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import BigNumber from 'bignumber.js'
import {InlineError, InlineErrorProps} from '../InlineError'
import {DialogState} from '../Dialog'
import {DST_CHAIN} from '../chains'
import {FeeEstimates} from '../wallet-state'
import {useFormatters} from '../../settings-state'
import {UNITS} from '../units'
import speedLow from '../../assets/icons/speed-low.svg'
import speedMedium from '../../assets/icons/speed-medium.svg'
import speedHigh from '../../assets/icons/speed-high.svg'
import {FeeLevel, allFeeLevels} from '../../web3'
import {DialogError} from './DialogError'
import {TKeyRenderer} from '../i18n'
import {Trans} from '../Trans'
import './DialogFee.scss'

const {Dust} = UNITS

interface DialogFeeProps {
  id?: string
  label?: string
  className?: string
  defaultValue?: string
  onChange: (value: string, feeLevel: FeeLevel | null) => void
  feeEstimates?: FeeEstimates
  feeEstimateError?: string | Error | null
  forceCustom?: boolean
  isPending?: boolean
}

const feeLevelLabels: Record<FeeLevel, TKeyRenderer> = {
  low: ['wallet', 'feeEstimateLevels', 'low'],
  medium: ['wallet', 'feeEstimateLevels', 'medium'],
  high: ['wallet', 'feeEstimateLevels', 'high'],
}

const feeLevelIcons: Record<FeeLevel, React.ReactNode> = {
  low: <SVG src={speedLow} className="icon" title="Low" />,
  medium: <SVG src={speedMedium} className="icon" title="Medium" />,
  high: <SVG src={speedHigh} className="icon" title="High" />,
}

const fieldDisplayAmount = (amount: BigNumber): string => Dust.fromBasic(amount).toString(10)

export const DialogFee: FunctionComponent<InlineErrorProps & DialogFeeProps> = ({
  label,
  className,
  onChange,
  feeEstimates,
  feeEstimateError,
  defaultValue = '0',
  errorMessage,
  forceCustom = false,
  isPending = false,
}: DialogFeeProps & InlineErrorProps) => {
  const [value, setValue] = useState<string>(defaultValue)
  const [feeLevel, setFeeLevel] = useState<FeeLevel | null>(defaultValue === '0' ? 'medium' : null)
  const inputRef = useRef<Input>(null)

  const {setErrorMessage} = DialogState.useContainer()
  const {abbreviateAmount} = useFormatters()

  const displayAmount = (amount: BigNumber): string =>
    abbreviateAmount(Dust.fromBasic(amount)).relaxed

  useEffect(() => {
    if (feeLevel != null && feeEstimates) {
      setValue(fieldDisplayAmount(feeEstimates[feeLevel]))
    }
  }, [feeEstimates])

  useEffect(() => {
    if (feeEstimates) onChange(value, feeLevel)
  }, [value])

  useEffect(() => {
    if (feeLevel !== null && forceCustom) {
      setFeeLevel(null)
    }
  }, [forceCustom])

  const onChangeWithDialogReset = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage('')
    setValue(e.target.value)
  }

  const isCustom = feeLevel === null

  if (!feeEstimates) {
    return (
      <div className={classnames('DialogFee', className)}>
        {label && <label className="label">{label}</label>}
        {isPending ? (
          <div className="loading">
            <LoadingOutlined spin />
            <br />
            <span>
              <Trans k={['wallet', 'message', 'loadingFeeEstimates']} />
            </span>
          </div>
        ) : (
          <DialogError>
            <Trans k={['wallet', 'error', 'couldNotLoadFeeEstimates']} />
          </DialogError>
        )}
      </div>
    )
  }

  return (
    <div className={classnames('DialogFee', className)} data-testid="dialog-fee">
      {label && <label className="label">{label}</label>}
      <InlineError errorMessage={errorMessage}>
        <div className={classnames('options', {'custom-mode': isCustom})}>
          <Input
            aria-label="Custom fee"
            value={value}
            className="input"
            onChange={onChangeWithDialogReset}
            type="number"
            ref={inputRef}
          />
          <Button
            className={classnames('button', 'custom', {inactive: !isCustom})}
            onClick={(e) => {
              e.preventDefault()
              setFeeLevel(null)
              inputRef.current?.focus()
            }}
          >
            <Trans k={['wallet', 'feeEstimateLevels', 'custom']} />
          </Button>
          {allFeeLevels.map((level) => (
            <Button
              disabled={forceCustom}
              className={classnames('button', level, {inactive: feeLevel !== level})}
              onClick={() => {
                setValue(fieldDisplayAmount(feeEstimates[level]))
                setFeeLevel(level)
              }}
              key={level}
            >
              {isCustom ? (
                <Popover
                  content={
                    <span>
                      {displayAmount(feeEstimates[level])} {DST_CHAIN.symbol}
                    </span>
                  }
                >
                  <span>{feeLevelIcons[level]}</span>
                </Popover>
              ) : (
                <span>
                  <Trans k={feeLevelLabels[level]} />
                  <br />
                  <span className="fee-amount">
                    {displayAmount(feeEstimates[level])} {DST_CHAIN.symbol}
                  </span>
                </span>
              )}
            </Button>
          ))}
        </div>
      </InlineError>
      {feeEstimateError != null && (
        <div className="warning">
          <Trans k={['wallet', 'error', 'couldNotUpdateFeeEstimates']} />
        </div>
      )}
    </div>
  )
}
