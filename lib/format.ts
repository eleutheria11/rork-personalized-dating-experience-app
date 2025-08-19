import * as Localization from 'expo-localization';

export function getLocale(): string {
  const tag = Localization.getLocales?.()[0]?.languageTag;
  return tag ?? 'en-US';
}

export function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  const options: Intl.DateTimeFormatOptions = opts ?? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(getLocale(), options).format(date);
}

export function formatTime(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  const options: Intl.DateTimeFormatOptions = opts ?? { hour: 'numeric', minute: '2-digit' };
  return new Intl.DateTimeFormat(getLocale(), options).format(date);
}

export type BudgetTier = 'low' | 'medium' | 'high';

export function formatBudget(tier: BudgetTier, currency: string = 'USD'): string {
  let approx = 40;
  if (tier === 'medium') approx = 80; else if (tier === 'high') approx = 150;
  const nf = new Intl.NumberFormat(getLocale(), { style: 'currency', currency, maximumFractionDigits: 0 });
  return nf.format(approx);
}
