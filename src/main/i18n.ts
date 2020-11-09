import i18next, {ResourceLanguage} from 'i18next'
import ElectronLog from 'electron-log'
import {
  DEFAULT_LANGUAGE,
  Language,
  TypedTFunction,
  GenericTError,
  Namespace,
  DEFAULT_NAMESPACE,
} from '../shared/i18n'
import mainTranslationsEn from '../translations/en/main.json'
import {Path} from '../shared/typeUtils'

export function createAndInitI18nForMain(language: Language): typeof i18next {
  const i18n = i18next.createInstance()

  const resources: Record<Language, Record<Namespace, ResourceLanguage>> = {
    en: {
      translations: mainTranslationsEn,
    },
  }

  i18n.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: DEFAULT_NAMESPACE,
    resources,

    initImmediate: true,

    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

const i18nDefault = createAndInitI18nForMain(DEFAULT_LANGUAGE)

type MainTranslations = typeof mainTranslationsEn

type TKeyMain = Path<MainTranslations>
export type TFunctionMain = TypedTFunction<MainTranslations>

const tKeyMainToString = (key: TKeyMain): string => key.join('.')

export const createTFunctionMain = (i18n: typeof i18next): TFunctionMain => (key, options) =>
  i18n.t(tKeyMainToString(key), options)

export class TErrorMain extends GenericTError<MainTranslations> {}

export const translateErrorMain = (
  mainLog: ElectronLog.ElectronLog,
  t: TFunctionMain,
  e: Error,
): string => {
  if (e instanceof TErrorMain) {
    return t(e.tKey, e.options)
  }

  mainLog.warn(`Untranslated error: ${e.message}`, e)
  return e.message
}

export function createTErrorMain(
  tKey: TKeyMain,
  options?: Parameters<TFunctionMain>[1],
): TErrorMain {
  return new TErrorMain(i18nDefault.t(tKeyMainToString(tKey), options), tKey, options)
}
