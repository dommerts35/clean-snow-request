import { useI18n } from './i18n';
import { formatLocaleCurrency, formatLocaleDate, formatLocaleDuration, formatLocaleNumber, interpolate } from './locale-utils';

export function useAccountI18n() {
  const { lang, t } = useI18n();
  return {
    lang, a: t.account,
    text: interpolate,
    date: (value: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => formatLocaleDate(value, lang, options),
    time: (value: string | Date) => formatLocaleDate(value, lang, { hour: 'numeric', minute: '2-digit' }),
    number: (value: number) => formatLocaleNumber(value, lang),
    currency: (value: number, currency = 'USD') => formatLocaleCurrency(value, lang, currency),
    duration: (value: number) => formatLocaleDuration(value, lang),
    status: (value: string) => t.account.statuses[value as keyof typeof t.account.statuses] ?? value,
    service: (value: string) => t.serviceLabels[value as keyof typeof t.serviceLabels] ?? ({
      'Limpieza de ventanas': t.account.calendar.window, 'Retiro de nieve': t.account.calendar.snow, 'Ambos servicios': t.account.calendar.both,
    } as Record<string, string>)[value] ?? value,
    property: (value: string) => t.propertyLabels[value as keyof typeof t.propertyLabels] ?? value,
  };
}