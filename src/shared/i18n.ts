import {TOptions, TFunctionResult, StringMap} from 'i18next'
import {ExtendableError} from './extendable-error'
import {Path} from './typeUtils'

export const DEFAULT_LANGUAGE = 'en'

// LANGUAGES should be using BCP-47 language tag format
export const LANGUAGES = [DEFAULT_LANGUAGE] as const
export type Language = typeof LANGUAGES[number]

export interface TypedTFunction<T extends object> {
  <TResult extends TFunctionResult = string, TInterpolationMap extends object = StringMap>(
    key: Path<T>,
    options?: TOptions<TInterpolationMap> | string,
  ): TResult
}

export class GenericTError<T extends object> extends ExtendableError {
  tKey: Path<T>
  options?: TOptions<StringMap> | string

  constructor(message: string, tKey: Path<T>, options?: TOptions<StringMap> | string) {
    super(message)
    this.tKey = tKey // eslint-disable-line
    this.options = options // eslint-disable-line
  }
}
