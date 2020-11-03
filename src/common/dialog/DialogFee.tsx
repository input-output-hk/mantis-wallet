import React, {useState, useRef, useEffect, ReactNode, FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {Input, Button, Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {LoadingOutlined} from '@ant-design/icons'
import {InlineError, InlineErrorProps} from '../InlineError'
import {DialogState} from '../Dialog'
import {ETC_CHAIN} from '../chains'
import {FeeEstimates, FeeLevel, allFeeLevels} from '../wallet-state'
import {useFormatters} from '../../settings-state'
import speedLow from '../../assets/icons/speed-low.svg'
import speedMedium from '../../assets/icons/speed-medium.svg'
import speedHigh from '../../assets/icons/speed-high.svg'
import {DialogError} from './DialogError'
import {TKeyRenderer} from '../i18n'
import {Trans} from '../Trans'
import {Wei, asEther, etherValue} from '../units'
import './DialogFee.scss'

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

interface DisplayEstimateProps {
  customMode: boolean
  level: FeeLevel
  estimate: Wei
}

const feeLevelLabels: Record<FeeLevel, TKeyRenderer> = {
  low: ['wallet', 'feeEstimateLevels', 'low'],
  medium: ['wallet', 'feeEstimateLevels', 'medium'],
  high: ['wallet', 'feeEstimateLevels', 'high'],
}

const feeLevelIcons: Record<FeeLevel, ReactNode> = {
  low: <SVG src={speedLow} className="icon" title="Low" />,
  medium: <SVG src={speedMedium} className="icon" title="Medium" />,
  high: <SVG src={speedHigh} className="icon" title="High" />,
}

const MAX_DECIMAL_PLACES_TO_SHOW = 9
const MIN_AMOUNT_TO_DISPLAY = asEther(new BigNumber(1).shiftedBy(-MAX_DECIMAL_PLACES_TO_SHOW))

const fieldDisplayAmount = (amount: Wei): string => etherValue(amount).toString(10)

const DisplayEstimate = ({customMode, level, estimate}: DisplayEstimateProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()

  const isUnderLimit = estimate.isLessThan(MIN_AMOUNT_TO_DISPLAY)

  const displayAmount = isUnderLimit
    ? `< ${abbreviateAmount(etherValue(MIN_AMOUNT_TO_DISPLAY)).relaxed}`
    : abbreviateAmount(etherValue(estimate).dp(9)).relaxed

  return (
    <Popover
      content={
        <span>
          {abbreviateAmount(etherValue(estimate)).relaxed} {ETC_CHAIN.symbol}
        </span>
      }
    >
      {customMode ? (
        <span>{feeLevelIcons[level]}</span>
      ) : (
        <span>
          <Trans k={feeLevelLabels[level]} />
          <br />
          <span className="fee-amount">
            {displayAmount} {ETC_CHAIN.symbol}
          </span>
        </span>
      )}
    </Popover>
  )
}

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

  useEffect(() => {
    if (feeLevel != null && feeEstimates) {
      setValue(etherValue(feeEstimates[feeLevel]).toString(10))
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
              <DisplayEstimate estimate={feeEstimates[level]} level={level} customMode={isCustom} />
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
