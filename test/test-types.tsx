import { createTranslationsFactory } from '../src/index';

const i18n = createTranslationsFactory<'fi' | 'en', 'fi'>('fi');

type Translations = typeof i18n.Translations;

const _valid = {
  title: {
    fi: 'Otsikko',
    en: 'Title',
  },
} satisfies Translations;

const _validJsx = {
  title: {
    fi: <span>Otsikko</span>,
    en: <span>Title</span>,
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

const _functionTranslation = {
  columnProduct: (name: string) => ({
    fi: `Tuote ${name}`,
    en: `Product ${name}`,
  }),
} satisfies Translations;

const _functionJsxTranslation = {
  columnProduct: (name: string) => ({
    fi: (
      <>
        Tuote <span>{name}</span>
      </>
    ),
    en: (
      <>
        Product <span>{name}</span>
      </>
    ),
  }),
} satisfies Translations;

const _mismatchedProps = {
  columnProduct: (foo: number) => ({
    fi: `${foo}`,
    en: `${foo}`,
  }),
} satisfies Translations;
