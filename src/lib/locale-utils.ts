export type Locale = 'en' | 'es';
export const LANGUAGE_STORAGE_KEY = 'clara-lang';
export function isLocale(value: unknown): value is Locale { return value === 'en' || value === 'es'; }
export function resolveLocale(saved: unknown, browser: string, preferred?: unknown): Locale {
  if (isLocale(preferred)) return preferred;
  if (isLocale(saved)) return saved;
  return browser.toLowerCase().startsWith('es') ? 'es' : 'en';
}
export function localeTag(lang: Locale) { return lang === 'es' ? 'es-US' : 'en-US'; }
export function interpolate(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
export function formatLocaleDate(value: Date | string, lang: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeTag(lang), options).format(new Date(value));
}
export function formatLocaleNumber(value: number, lang: Locale) { return new Intl.NumberFormat(localeTag(lang)).format(value); }
export function formatLocaleCurrency(value: number, lang: Locale, currency = 'USD') {
  return new Intl.NumberFormat(localeTag(lang), { style: 'currency', currency }).format(value);
}
export function formatLocaleDuration(minutes: number, lang: Locale) {
  const hours = Math.floor(minutes / 60), rest = minutes % 60;
  const unit = (value: number, name: 'hour' | 'minute') => new Intl.NumberFormat(localeTag(lang), { style: 'unit', unit: name, unitDisplay: 'short' }).format(value);
  return `${unit(hours, 'hour')} ${unit(rest, 'minute')}`;
}