import i18next from 'i18next'
import {DEFAULT_LANGUAGE, Language, TypedTFunction} from '../shared/i18n'
import mainTranslationsEn from '../translations/en/main.json'

export function createAndInitI18nForMain(language: Language): typeof i18next {
  const i18n = i18next.createInstance()

  i18n.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'translations',
    resources: {
      en: {
        translations: mainTranslationsEn,
      },
    },

    initImmediate: true,

    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

type MainTranslations = typeof mainTranslationsEn

export type TFunctionMain = TypedTFunction<MainTranslations>

export const createTFunctionMain = (i18n: typeof i18next): TFunctionMain => (key, options) =>
  i18n.t(key.join('.'), options)
