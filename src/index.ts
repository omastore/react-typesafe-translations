import { useMemo, useSyncExternalStore } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: We need to use any for the generic function arguments
type FunctionType = (...args: any[]) => string;

export const createTranslationsFactory = <Lang extends string, BaseLang extends Lang>(baseLanguage: BaseLang) => {
  type StringTranslation = {
    [L in BaseLang]: string;
  } & {
    [L in Exclude<Lang, BaseLang>]: string | undefined;
  };

  type FunctionTranslation = {
    [L in BaseLang]: FunctionType;
  } & {
    [L in Exclude<Lang, BaseLang>]: FunctionType | undefined;
  };

  type Translation = StringTranslation | FunctionTranslation;

  type Translations = Record<string, Translation>;

  type ResolvedTranslations<T> = {
    [P in keyof T]: T[P] extends { [K in BaseLang]: infer BaseValue }
      ? BaseValue extends (...args: unknown[]) => string
        ? BaseValue
        : string
      : never;
  };

  type OtherLangFunctions<T, BL extends string> = T extends { [K in BL]: infer _ }
    ? { [K in Exclude<keyof T, BL>]: T[K] }
    : never;

  type BaseLangFunction<T, BL extends string> = T extends { [K in BL]: infer F } ? F : never;

  type AllOtherLangsSameFn<T, BL extends string> = OtherLangFunctions<T, BL>[keyof OtherLangFunctions<
    T,
    BL
  >] extends never
    ? {}
    : OtherLangFunctions<T, BL>[keyof OtherLangFunctions<T, BL>] extends BaseLangFunction<T, BL>
      ? {}
      : never;

  type AssertAllSameFn<T, BL extends string = BaseLang> = {
    [K in keyof T]: T[K] extends { [P in BL]: infer Base }
      ? Base extends (...args: any[]) => any
        ? AllOtherLangsSameFn<T[K], BL>
        : {}
      : {};
  }[keyof T];

  // --- End AssertAllSameFn ---

  let currentLang: Lang = baseLanguage;
  const listeners = new Set<() => void>();

  /**
   * Returns the current language.
   */
  const getLanguage = () => currentLang;

  /**
   * Sets the current language and notifies all subscribers.
   * @param lang The language to set.
   */
  const setLanguage = (lang: Lang) => {
    currentLang = lang;
    for (const listener of listeners) {
      listener();
    }
  };

  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  /**
   * Hook to subscribe to language changes.
   * @returns The current language.
   */
  const useLanguage = () => useSyncExternalStore(subscribe, getLanguage);

  /**
   * Hook to get translations for the current language.
   * @param translations The translations object.
   * @returns An object with a `t` function to translate keys.
   */
  const useTranslations = <T extends Translations & AssertAllSameFn<T, BaseLang>>(translations: T) => {
    const language = useLanguage();

    const t: ResolvedTranslations<T> = useMemo(() => {
      const resolved = Object.fromEntries(
        Object.entries(translations).map(([key, translationEntry]) => {
          const baseTranslation = translationEntry[baseLanguage];
          if (typeof baseTranslation === 'function') {
            const translatedFunc = (...args: unknown[]) => {
              // biome-ignore lint/complexity/noBannedTypes: We need to cast to Function to call it
              const chosenFunc = (translationEntry[language] ?? baseTranslation) as Function;
              return chosenFunc(...args);
            };
            return [key, translatedFunc];
          }

          const translatedString = (translationEntry[language] ?? baseTranslation) as string;
          return [key, translatedString];
        }),
      );

      return resolved as ResolvedTranslations<T>;
    }, [language, baseLanguage, translations]);

    return { t };
  };

  return {
    useTranslations,
    getLanguage,
    setLanguage,
    useLanguage,
    Translations: null as unknown as Translations,
  };
};
