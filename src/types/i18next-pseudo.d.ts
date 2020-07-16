// Copy from https://github.com/MattBoatman/i18next-pseudo/
// see https://github.com/MattBoatman/i18next-pseudo/issues/6
declare module 'i18next-pseudo' {
  import {PostProcessorModule} from 'i18next'

  interface Options {
    enabled?: boolean
    languageToPseudo?: string
    letterMultiplier?: number
    letters?: Record<string, string>
    repeatedLetters?: string[]
    uglifedLetterObject?: Record<string, string>
    wrapped?: boolean
  }

  interface Pseudo extends PostProcessorModule {
    configurePseudo(options: Options): void
    options: Options
    new (): any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  class Pseudo {
    constructor(options?: Options)

    name: string
  }

  export = Pseudo
}
