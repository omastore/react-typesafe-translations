import { useMemo, useSyncExternalStore } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: We need to use any for the generic function arguments
type FunctionTranslation = (...args: any[]) => string;

export const createTranslationsFactory = <Lang extends string, BaseLang extends Lang>(baseLanguage: BaseLang) => {
  type Translation = Record<Lang, string | undefined> | Record<Lang, FunctionTranslation | undefined>;

  type Translations = Record<string, Translation>;

  type Value = string | FunctionTranslation | undefined;

  type RequireBaseLanguage<Langs extends string, Base extends Langs> = Record<
    string,
    { [K in Base]: Exclude<Value, undefined> } & { [K in Exclude<Langs, Base>]: Value }
  >;

  type ResolvedTranslations<T> = {
    [P in keyof T]: T[P] extends Record<BaseLang, infer BaseValue>
      ? BaseValue extends (...args: unknown[]) => string
        ? BaseValue
        : string
      : never;
  };

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
  const useTranslations = <T extends Translations>(translations: T) => {
    const language = useLanguage();

    const t = useMemo(() => {
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
    Translations: null as unknown as RequireBaseLanguage<Lang, BaseLang>,
  };
};
