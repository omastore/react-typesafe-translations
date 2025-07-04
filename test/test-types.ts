import { createTranslationsFactory } from '../src/index';

const i18n = createTranslationsFactory<'fi' | 'en', 'fi'>('fi');

type Translations = typeof i18n.Translations;

const _valid = {
  title: {
    fi: 'Otsikko',
    en: 'Title',
  },
} satisfies Translations;

const _missingLocale = {
  // @ts-expect-error
  columnProduct: {
    fi: 'Tuote',
  },
} satisfies Translations;

const _allowedUndefined = {
  columnProduct: {
    fi: 'Product',
    en: undefined,
  },
} satisfies Translations;

const _illegalUndefined = {
  columnProduct: {
    // @ts-expect-error
    fi: undefined,
    en: 'Product',
  },
} satisfies Translations;

const _extraLocale = {
  columnProduct: {
    fi: 'Tuote',
    en: 'Product',
    // @ts-expect-error
    de: 'Produkt',
  },
} satisfies Translations;

const _mismatchedTypes = {
  // @ts-expect-error
  columnProduct: {
    fi: 'Tuote',
    en: () => 'Product',
  },
} satisfies Translations;

const _mismatchedProps = {
  columnProduct: {
    fi: (foo: number) => `${foo}`,
    en: (foo: string) => `${foo}`,
  },
} satisfies Translations;

() => {
  // @ts-expect-error
  i18n.useTranslations(_mismatchedProps);
};
