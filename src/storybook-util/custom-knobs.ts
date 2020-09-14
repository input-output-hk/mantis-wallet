import {number} from '@storybook/addon-knobs'
import {action, ActionOptions} from '@storybook/addon-actions'
import BigNumber from 'bignumber.js'
import {UNITS} from '../common/units'

export const ether = (name: string, value: number): BigNumber =>
  UNITS.Ether.toBasic(new BigNumber(number(name, value)))

export const asyncAction = (
  name: string,
  delay = 1000,
  options?: ActionOptions | undefined,
  // eslint-disable-next-line
): ((...args: any[]) => Promise<void>) => {
  return (...args) =>
    new Promise(function(resolve) {
      setTimeout(resolve, delay)
    }).then(() => action(name, options)(args))
}
