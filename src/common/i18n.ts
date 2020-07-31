import i18next from 'i18next'
import BigNumber from 'bignumber.js'
import {initReactI18next} from 'react-i18next'
import {Locale} from 'date-fns'
import {enUS} from 'date-fns/locale'
import {Path} from '../shared/typeUtils'
import {DEFAULT_LANGUAGE, Language, TypedTFunction, GenericTError} from '../shared/i18n'
import rendererTranslationsEn from '../translations/en/renderer.json'
import {pseudoLanguage} from './i18n-pseudo'

export function createAndInitI18nForRenderer(
  language: Language = DEFAULT_LANGUAGE,
  pseudo = false,
): typeof i18next {
  const i18n = i18next.createInstance()

  if (pseudo) i18n.use(pseudoLanguage)

  i18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'translations',
    resources: {
      en: {
        translations: rendererTranslationsEn,
      },
    },

    postProcess: pseudo ? [pseudoLanguage.name] : [],

    initImmediate: true,

    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

type RendererTranslations = typeof rendererTranslationsEn

export type TKeyRenderer = Path<RendererTranslations>
export type TFunctionRenderer = TypedTFunction<RendererTranslations>

export interface Translatable {
  tKey: TKeyRenderer
  options?: Parameters<TFunctionRenderer>[1]
}

export const tKeyRendererToString = (key: TKeyRenderer): string => key.join('.')

export const createTFunctionRenderer = (i18n: typeof i18next): TFunctionRenderer => (
  key,
  options,
) => i18n.t(tKeyRendererToString(key), options)

interface LanguageSettings {
  dateFnsLocale: Locale
  numberFormat: Intl.NumberFormat
  bigNumberFormat: Required<BigNumber.Format>
}

export const EN_US_BIG_NUMBER_FORMAT = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
} as const

export const LANGUAGE_SETTINGS: Record<Language, LanguageSettings> = {
  en: {
    dateFnsLocale: enUS,
    numberFormat: new Intl.NumberFormat('en-US'),
    // TODO it would be better if this was sourced from authoritative source
    bigNumberFormat: EN_US_BIG_NUMBER_FORMAT,
  },
} as const

export class TErrorRenderer extends GenericTError<RendererTranslations> {}

const i18nDefault = createAndInitI18nForRenderer()

export function createTErrorRenderer(
  tKey: TKeyRenderer,
  options?: Parameters<TFunctionRenderer>[1],
): TErrorRenderer {
  return new TErrorRenderer(i18nDefault.t(tKeyRendererToString(tKey), options), tKey, options)
}
