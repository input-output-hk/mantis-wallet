import {TOptions, TFunctionResult, StringMap} from 'i18next'
import {Path} from './typeUtils'

export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGES = [DEFAULT_LANGUAGE] as const
export type Language = typeof LANGUAGES[number]

export interface TypedTFunction<T extends object> {
  <TResult extends TFunctionResult = string, TInterpolationMap extends object = StringMap>(
    key: Path<T>,
    options?: TOptions<TInterpolationMap> | string,
  ): TResult
}
