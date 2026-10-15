# Strings

## How strings work

All 57 user-facing strings live in two typed dictionaries: `src/shared/i18n/en.ts` for English, the default, and `sv.ts` for Swedish. The tables below list every key, and the code files mirror them key by key.

- **Keys are `group.name`**, such as `cart.send`. In code that is `t.cart.send`.
- **Text with values is a function.** `{table}` in a table becomes a parameter, as in `t.common.table(3)`.
- **Plurals are functions of `count`**, with one form for 1 and one for every other number. The tables show both forms, such as "1 drink / {count} drinks". `bar.age` shows "Just now" under one minute.
- **`category` and `status` match the schemas.** Their keys are the values of `DrinkCategory` and `OrderStatus`, so `t.category[drink.category]` and `t.status[order.status]` are type-checked.
- **Times and lists are formatted before they are passed in.** Format `{time}` with `Intl.DateTimeFormat` and `{drinks}` with `Intl.ListFormat`, both in the current locale.
- **Language names are not translated.** "English" and "Svenska" are always shown in their own language and live in `locale.ts`.
- **Menu content is not translated.** Drink names and ingredients are data from Firestore.

**`en.ts` (excerpt)**

```ts
export const en = {
  common: {
    appName: 'Wedding Drinks',
    table: (table: number) => `Table ${table}`,
    // ...
  },
  cart: {
    count: (count: number) => (count === 1 ? '1 drink' : `${count} drinks`),
    send: 'Send to the bar',
    // ...
  },
  // ...
};

export type Strings = typeof en;
```

**`sv.ts` (excerpt)**

A missing key or a parameter of the wrong type in `sv.ts` fails `npm run typecheck`.

```ts
import type { Strings } from '@/shared/i18n/en';

export const sv: Strings = {
  common: {
    appName: 'Wedding Drinks',
    table: (table: number) => `Bord ${table}`,
    // ...
  },
  // ...
};
```

**`src/shared/i18n/locale.ts`**

```ts
export const LOCALES = ['en', 'sv'] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language is named in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', sv: 'Svenska' };

const STORAGE_KEY = 'locale';

export function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'sv') return saved;
  } catch {
    // Storage can be blocked, for example in private browsing.
  }
  return navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en';
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The choice then only lasts for this visit.
  }
}
```

**`src/shared/i18n/I18nContext.ts`**

```ts
import { createContext } from 'react';
import type { Strings } from '@/shared/i18n/en';
import type { Locale } from '@/shared/i18n/locale';

export type I18n = {
  locale: Locale;
  strings: Strings;
  setLocale: (locale: Locale) => void;
};

export const I18nContext = createContext<I18n | null>(null);
```

**`src/shared/i18n/useStrings.ts`**

```ts
import { useContext } from 'react';
import { I18nContext, type I18n } from '@/shared/i18n/I18nContext';

export function useI18n(): I18n {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error('useI18n must be used inside I18nProvider');
  return i18n;
}

export const useStrings = () => useI18n().strings;
```

**`src/shared/i18n/I18nProvider.tsx`**

```tsx
import { useEffect, useState, type ReactNode } from 'react';
import { en, type Strings } from '@/shared/i18n/en';
import { I18nContext } from '@/shared/i18n/I18nContext';
import { initialLocale, saveLocale, type Locale } from '@/shared/i18n/locale';
import { sv } from '@/shared/i18n/sv';

const dictionaries: Record<Locale, Strings> = { en, sv };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    saveLocale(locale);
  }, [locale]);

  return <I18nContext value={{ locale, strings: dictionaries[locale], setLocale }}>{children}</I18nContext>;
}
```

**Using strings in a component**

```tsx
import { useI18n } from '@/shared/i18n/useStrings';
import type { Order } from '@/shared/schemas/order';

export function OrderRow({ order }: { order: Order }) {
  const { locale, strings: t } = useI18n();
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(order.createdAt);

  return (
    <li>
      <span>{t.myOrders.orderedAt(time)}</span>
      <span>{t.status[order.status]}</span>
    </li>
  );
}
```

A list of drink names is formatted the same way, then passed to the string:

```ts
const names = new Intl.ListFormat(locale, { type: 'conjunction' }).format(drinks.map((drink) => drink.name));
t.cart.soldOut(names); // "Peroni and Konjak sold out after you added them. ..."
```

## Guest view

The guest view uses 37 strings. `common`, `category` and `status` are also used by the bar.

### common

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `common.appName` | Wedding Drinks | Wedding Drinks |  |
| `common.loading` | Loading… | Laddar… |  |
| `common.cancel` | Cancel | Avbryt |  |
| `common.close` | Close | Stäng |  |
| `common.reload` | Reload | Ladda om |  |
| `common.errorTitle` | Something went wrong | Något gick fel |  |
| `common.languageLabel` | Language | Språk |  |
| `common.table` | Table {table} | Bord {table} | `table: number` |

### notFound

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `notFound.title` | Page not found | Sidan finns inte |  |
| `notFound.unknownTable` | We couldn't find that table. Scan the QR code on your table again. | Vi hittar inte det bordet. Skanna QR-koden på ditt bord igen. |  |

### menu

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `menu.intro` | Choose your drinks and we'll bring them to your table. | Välj dina drinkar, så bär vi ut dem till ditt bord. |  |
| `menu.add` | Add {drink} | Lägg till {drink} | `drink: string` |
| `menu.remove` | Remove {drink} | Ta bort {drink} | `drink: string` |
| `menu.quantity` | Quantity: {count} | Antal: {count} | `count: number` |
| `menu.soldOut` | Sold out | Slut |  |

### category

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `category.cocktail` | Cocktails | Drinkar |  |
| `category.mocktail` | Mocktails | Mocktails |  |
| `category.wine` | Wine | Vin |  |
| `category.beer` | Beer | Öl |  |
| `category.digestif` | Digestifs | Avec |  |

### cart

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `cart.count` | 1 drink / {count} drinks | 1 drink / {count} drinkar | `count: number` (1 / other) |
| `cart.send` | Send to the bar | Skicka till baren |  |
| `cart.sending` | Sending… | Skickar… |  |
| `cart.clear` | Clear | Töm |  |
| `cart.clearTitle` | Clear your order? | Tömma beställningen? |  |
| `cart.clearBody` | All selected drinks will be removed. | Alla valda drinkar tas bort. |  |
| `cart.empty` | Choose at least one drink. | Välj minst en drink. |  |
| `cart.soldOut` | {drinks} sold out after you added them. Remove them to send your order. | {drinks} tog slut efter att du lade till dem. Ta bort dem för att skicka beställningen. | `drinks: string` |
| `cart.sent` | Your order has been sent. We'll bring your drinks to your table. | Beställningen är skickad. Vi bär ut drinkarna till ditt bord. |  |
| `cart.sendError` | Your order could not be sent. Check your connection and try again. | Beställningen kunde inte skickas. Kontrollera anslutningen och försök igen. |  |

### myOrders

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `myOrders.title` | Your orders | Dina beställningar |  |
| `myOrders.empty` | You haven't ordered anything yet. | Du har inte beställt något än. |  |
| `myOrders.orderedAt` | Ordered at {time} | Beställd {time} | `time: string` |
| `myOrders.statusChanged` | Your order from {time} is now: {status} | Din beställning från {time} är nu: {status} | `time: string`, `status: string` |

### status

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `status.new` | Received | Mottagen |  |
| `status.preparing` | Being prepared | Görs i ordning |  |
| `status.done` | Served | Serverad |  |

## Bar and sign-in

The bar view and its sign-in page use 20 strings of their own.

### login

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `login.title` | Bar sign-in | Logga in i baren |  |
| `login.email` | Email | E-post |  |
| `login.password` | Password | Lösenord |  |
| `login.submit` | Sign in | Logga in |  |
| `login.submitting` | Signing in… | Loggar in… |  |
| `login.invalid` | Wrong email or password. | Fel e-post eller lösenord. |  |
| `login.notStaff` | This account doesn't have access to the bar. | Det här kontot har inte tillgång till baren. |  |

### bar

| Key | English | Swedish | Parameters |
| --- | --- | --- | --- |
| `bar.ordersTab` | Orders | Beställningar |  |
| `bar.menuTab` | Menu | Meny |  |
| `bar.activeCount` | 1 active order / {count} active orders | 1 aktiv beställning / {count} aktiva beställningar | `count: number` (1 / other) |
| `bar.empty` | No active orders. | Inga aktiva beställningar. |  |
| `bar.age` | Just now / {minutes} min ago | Nyss / För {minutes} min sedan | `minutes: number` (under 1 / other) |
| `bar.startPreparing` | Start preparing | Påbörja |  |
| `bar.markDone` | Mark as served | Markera som serverad |  |
| `bar.newOrder` | New order from table {table} | Ny beställning från bord {table} | `table: number` |
| `bar.statusError` | The status could not be updated. Try again. | Statusen kunde inte uppdateras. Försök igen. |  |
| `bar.inStock` | {drink} in stock | {drink} finns i lager | `drink: string` |
| `bar.availabilityError` | The menu could not be updated. Try again. | Menyn kunde inte uppdateras. Försök igen. |  |
| `bar.signedInAs` | Signed in as {name} | Inloggad som {name} | `name: string` |
| `bar.signOut` | Sign out | Logga ut |  |
