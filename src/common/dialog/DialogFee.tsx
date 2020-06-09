import React, {useState, useRef, useEffect} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {Input, Button, Popover} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import BigNumber from 'bignumber.js'
import {InlineError, InlineErrorProps} from '../InlineError'
import {DialogState} from '../Dialog'
import {DUST_SYMBOL} from '../../pob/chains'
import {FeeEstimates} from '../wallet-state'
import {abbreviateAmount} from '../formatters'
import {UNITS} from '../../common/units'
import speedLow from '../../assets/icons/speed-low.svg'
import speedMedium from '../../assets/icons/speed-medium.svg'
import speedHigh from '../../assets/icons/speed-high.svg'
import {FeeLevel, allFeeLevels} from '../../web3'
import './DialogFee.scss'
import {DialogError} from './DialogError'

const {Dust} = UNITS

interface DialogFeeProps {
  id?: string
  label?: string
  className?: string
  defaultValue?: string
  onChange: (value: string, feeLevel: FeeLevel | null) => void
  feeEstimates?: FeeEstimates
  hideCustom?: boolean
  isPending?: boolean
}

const feeLevelLabels: Record<FeeLevel, string> = {
  low: 'Slow',
  medium: 'Average',
  high: 'Fast',
}

const feeLevelIcons: Record<FeeLevel, React.ReactNode> = {
  low: <SVG src={speedLow} className="icon" title="Low" />,
  medium: <SVG src={speedMedium} className="icon" title="Medium" />,
  high: <SVG src={speedHigh} className="icon" title="High" />,
}

const displayAmount = (amount: BigNumber): string =>
  abbreviateAmount(Dust.fromBasic(amount)).relaxed
const fieldDisplayAmount = (amount: BigNumber): string => Dust.fromBasic(amount).toString(10)

export const DialogFee: React.FunctionComponent<InlineErrorProps & DialogFeeProps> = ({
  label,
  className,
  onChange,
  feeEstimates,
  defaultValue = '0',
  errorMessage,
  hideCustom = false,
  isPending = false,
}: DialogFeeProps & InlineErrorProps) => {
  const [value, setValue] = useState<string>(defaultValue)
  const [feeLevel, setFeeLevel] = useState<FeeLevel | null>(
    defaultValue === '0' || hideCustom ? 'medium' : null,
  )
  const inputRef = useRef<Input>(null)

  const {setErrorMessage} = DialogState.useContainer()

  useEffect(() => {
    if (feeLevel != null && feeEstimates) {
      setValue(fieldDisplayAmount(feeEstimates[feeLevel]))
    }
  }, [feeEstimates])

  useEffect(() => {
    if (feeEstimates) onChange(value, feeLevel)
  }, [value])

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
            <span>Loading estimates</span>
          </div>
        ) : (
          <DialogError>Couldn’t load estimates, cannot continue</DialogError>
        )}
      </div>
    )
  }

  return (
    <div className={classnames('DialogFee', {hideCustom}, className)}>
      {label && <label className="label">{label}</label>}
      <InlineError errorMessage={errorMessage}>
        <div className={classnames('options', {'custom-mode': isCustom})}>
          {!hideCustom && (
            <>
              <Input
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
                Custom
              </Button>
            </>
          )}
          {allFeeLevels.map((level) => (
            <Button
              className={classnames('button', {inactive: feeLevel !== level})}
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
                      {displayAmount(feeEstimates[level])} {DUST_SYMBOL}
                    </span>
                  }
                >
                  <span>{feeLevelIcons[level]}</span>
                </Popover>
              ) : (
                <span>
                  {feeLevelLabels[level]}
                  <br />
                  <span className="fee-amount">
                    {displayAmount(feeEstimates[level])} {DUST_SYMBOL}
                  </span>
                </span>
              )}
            </Button>
          ))}
        </div>
      </InlineError>
    </div>
  )
}
