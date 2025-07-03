# react-typesafe-translations

A fully type-safe internationalization library for React applications with zero build steps and minimal boilerplate.

---

## Features

- **Full Type Safety** — Every translation key, parameter, and function signature is type-checked at compile time
- **Zero Build Steps** — No code generation or plugins needed
- **IDE Integration** — Autocomplete, go-to-definition, real-time type errors
- **Co-located Translations** — Keep translations close to components
- **Lightweight** — Minimal runtime using React's `useSyncExternalStore`
- **Function-based Interpolation** — Type-safe translation functions
- **Configurable Locale Rules** — Mark some languages as required, others as optional
- **No ICU Black Magic** — Formatting and logic are handled in code, not strings
- **No External Dependencies** — Pure TypeScript and React, no extra libraries
- **Small Bundle Size** — Minimal impact on your app's size
- **No missing translations** — Ensures all required languages have translations defined

---

## Installation

```bash
npm install react-typesafe-translations
# or
yarn add react-typesafe-translations
# or
pnpm add react-typesafe-translations
# or
bun add react-typesafe-translations
```

---

## Quick Start

### 1. Create the i18n utility

```ts
// utils/i18n.ts
import { createTranslationsFactory } from 'react-typesafe-translations';

export const i18n = createTranslationsFactory<'fi' | 'en', 'fi'>('fi');

export const setLanguage = i18n.setLanguage;
export const useLanguage = i18n.useLanguage;
export const useTranslations = i18n.useTranslations;
export type Translations = typeof i18n.Translations;
```

### 2. Define translations

```ts
// translations.ts
import type { Translations } from '~/utils/i18n';

export const translations = {
  welcome: {
    fi: 'Tervetuloa!',
    en: 'Welcome!',
  },
  greetUser: {
    fi: (name: string) => `Hei, ${name}!`,
    en: (name: string) => `Hello, ${name}!`,
  },
  itemCount: {
    fi: (count: number) => `${count} ${count === 1 ? 'kohde' : 'kohdetta'}`,
    en: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
  },
} satisfies Translations;
```

> 💡 Always use `satisfies Translations` — this enables full type checking and excess key detection.

### 3. Use in components

```ts
import { useTranslations } from '~/utils/i18n';
import { translations } from './translations';

export function WelcomeComponent() {
  const { t } = useTranslations(translations);

  return (
    <div>
      <h1>{t.welcome}</h1>
      <p>{t.greetUser('Alice')}</p>
      <span>{t.itemCount(5)}</span>
    </div>
  );
}
```

### 4. Change language

```ts
import { setLanguage } from '~/utils/i18n';

setLanguage('en');
```

---

## API Reference

### `createTranslationsFactory<AllLanguages, RequiredLanguages>(baseLanguage)`

Creates the i18n factory.

- `AllLanguages`: all allowed locales (e.g. `'en' | 'fi'`)
- `RequiredLanguages`: subset of `AllLanguages` that must have translations defined
- `baseLanguage`: used as fallback, must be one of `RequiredLanguages`

**Returns:**

- `useTranslations(translations)`
- `setLanguage(lang)`
- `useLanguage()`
- `Translations` type helper

### Translation Objects

```ts
const translations = {
  simple: {
    fi: 'Hei',
    en: 'Hello',
  },
  paramExample: {
    fi: (name: string) => `Moi, ${name}`,
    en: (name: string) => `Hi, ${name}`,
  },
} satisfies Translations;
```

> Languages listed in RequiredLanguages must have a translation. Other languages in AllLanguages may explicitly be set to undefined to indicate intentionally missing translations.
You are not allowed to omit translations completely for any language you've defined in AllLanguages.

---

## Multiple & Shared Translation Sets

You can define separate translation groups per component or domain:

```ts
const labels = {
  save: { fi: 'Tallenna', en: 'Save' },
  cancel: { fi: 'Peruuta', en: 'Cancel' },
} satisfies Translations;

const labels2 = {
  loading: { fi: 'Ladataan', en: 'Loading...' },
} satisfies Translations;
```

You can use multiple `useTranslations()` calls in one component if needed.

---

## Comparison

### react-typesafe-translations vs react-i18next vs typesafe-i18n

| Feature                       | react-typesafe-translations | react-i18next | typesafe-i18n |
| ----------------------------- | ---------- | ------------- | ------------- |
| Type-safe keys                | ✅          | ❌             | ✅             |
| Function param safety         | ✅          | ❌             | ✅             |
| Autocomplete translations     | ✅          | ❌             | ✅             |
| Jump to definition            | ✅          | ❌             | ✅             |
| `satisfies`-based validation  | ✅          | ❌             | ❌             |
| Build step required           | ❌          | ❌             | ✅             |
| External translation files    | ❌          | ✅             | ✅             |
| ICU message syntax            | ❌          | ✅             | ✅             |
| Per-component co-location     | ✅          | ❌             | ❌             |
| Runtime performance           | ✅          | Medium         | ✅             |
| Bundle size                   | Minimal     | Medium–Large   | Small         |
| Ease of setup                 | ✅          | ❌             | ❌             |

⚠️ While react-i18next has TypeScript types, it does not enforce key or param safety, nor provide strong IDE support out of the box.

### Summary

- **react-typesafe-translations** is ideal for apps maintained by developers, with translations co-located and inline, no build tools, and full TS safety.
- **react-i18next** is better for content-managed apps or translator-facing tools, but lacks TS integration.
- **typesafe-i18n** is also very type-safe, but requires codegen and centralized translation files. More scalable but less nimble. typesafe-i18n also has not been updated in a while, so it may not support the latest TypeScript features or React versions.

---

## Why No ICU? ##

react-typesafe-translations does not support ICU message syntax (e.g. {count, plural, one {# item} other {# items}}) — intentionally.

ICU-based formats rely on magic string parsing and brittle runtime logic. Instead, react-typesafe-translations encourages writing actual JavaScript functions for conditionals, plurals, and logic. This keeps translations maintainable, testable, and fully type-safe.

If you prefer ICU for translator-facing tooling, consider using react-i18next or typesafe-i18n instead.

---

## Best Practices

- Always use `satisfies Translations`
- Keep translations close to usage
- Keep base language values simple and complete
- Catch translation errors in CI by running typechecks
- Prefer small translation objects per component or domain

---

## Intended Use Cases

react-typesafe-translations is ideal for:

- Small to medium React apps
- Projects with 2–5 locales
- Developer-maintained translations
- High confidence in type safety and DX

---

### When Not to Use This

- Apps with 10+ languages (maintenance overhead grows linearly)
- Translator-facing tools (no JSON/XLIFF support)
- Apps needing dynamic runtime translations (e.g., CMS-driven)

---

## License

MIT

