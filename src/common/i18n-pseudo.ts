import {PostProcessorModule, TOptions} from 'i18next'
import {DEFAULT_LANGUAGE} from '../shared/i18n'

const lettersToChange: Record<string, string> = {
  a: 'ää',
  e: 'ḝḝ',
  i: 'ɨɨ',
  o: 'ỡỡ',
  u: 'ṵṵ',
  y: 'ẙẙ',
  A: 'ḀḀ',
  E: 'ƐƐ',
  I: 'ḬḬ',
  O: 'ṎṎ',
  U: 'ṲṲ',
  Y: 'ŶŶ',
} as const

export const pseudoLanguage: PostProcessorModule = {
  name: 'pseudoLanguage',
  type: 'postProcessor',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process: (value: string, _key: string, _options: TOptions, translator: any): string => {
    if (translator?.language !== DEFAULT_LANGUAGE) {
      return value
    }
    const processedValue = value
      .split('')
      .map((letter) => lettersToChange[letter] ?? letter)
      .join('')
    return `·${processedValue}·`
  },
}
