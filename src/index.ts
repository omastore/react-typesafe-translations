import { useMemo, useSyncExternalStore } from 'react';

export const createTranslationsFactory = <Lang extends string, BaseLang extends Lang>(baseLanguage: BaseLang) => {
  type StringTranslation = {
    [L in BaseLang]: NonNullable<React.ReactNode>;
  } & {
    [L in Exclude<Lang, BaseLang>]: React.ReactNode | undefined;
  };

  // biome-ignore lint/suspicious/noExplicitAny: We need to use any for the generic function arguments
  type Translation = StringTranslation | ((...args: any[]) => StringTranslation);

  type Translations = Record<string, Translation>;

  type ResolvedTranslations<T, Lang extends string = never> = {
    [P in keyof T]: T[P] extends (...args: infer Args) => Record<Lang, React.ReactNode>
      ? (...args: Args) => React.ReactNode
      : React.ReactNode;
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

    const t: ResolvedTranslations<T> = useMemo(() => {
      const resolved = Object.fromEntries(
        Object.entries(translations).map(([key, translationEntry]) => {
          if (typeof translationEntry === 'function') {
            const translatedFunc = (...args: unknown[]) => {
              const translation = translationEntry(...args) as Record<Lang, React.ReactNode | undefined>;
              const baseTranslation = translation[baseLanguage];
              const translatedString = (translation[language] ?? baseTranslation) as React.ReactNode;
              return translatedString;
            };
            return [key, translatedFunc];
          }

          const baseTranslation = translationEntry[baseLanguage];
          const translatedString = ((translationEntry as Record<Lang, React.ReactNode | undefined>)[language] ??
            baseTranslation) as React.ReactNode;
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
