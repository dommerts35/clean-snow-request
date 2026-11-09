import { useEffect, useRef, type ReactNode } from 'react';
import { useAccountI18n } from '@/lib/account-i18n';

/** Keep native constraints and focus behavior; only replace browser-language messages. */
export function LocalizedValidation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lang, a, text } = useAccountI18n();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    function update(event: Event) {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
      field.setCustomValidity('');
      const v = field.validity, copy = a.validation;
      if (v.valid) return;
      const message = v.valueMissing ? copy.required : v.typeMismatch ? copy.email : v.tooShort ? text(copy.short, { min: field instanceof HTMLSelectElement ? 0 : field.minLength }) : v.rangeUnderflow && field instanceof HTMLInputElement ? text(copy.min, { min: field.min }) : v.rangeOverflow && field instanceof HTMLInputElement ? text(copy.max, { max: field.max }) : v.stepMismatch && field instanceof HTMLInputElement ? text(copy.step, { step: field.step }) : copy.invalid;
      field.setCustomValidity(message);
    }
    root.querySelectorAll('input, select, textarea').forEach(field => update({ target: field } as unknown as Event));
    root.addEventListener('invalid', update, true);
    root.addEventListener('input', update, true);
    root.addEventListener('change', update, true);
    return () => { root.removeEventListener('invalid', update, true); root.removeEventListener('input', update, true); root.removeEventListener('change', update, true); };
  }, [lang, a.validation, text]);
  return <div ref={ref} className="contents">{children}</div>;
}