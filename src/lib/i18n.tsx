import { es } from './locales/es';
import { en } from './locales/en';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';
export const LANG_KEY = 'clara-lang';

/** Stored service values (database) — never translate these. */
export const SERVICE_VALUES = [
  'Limpieza de ventanas (residencial y comercial)',
  'Lavado a presión',
  'Limpieza de hogar',
  'Limpieza comercial y de negocios',
  'Varios servicios / paquete personalizado',
] as const;
export type ServiceValue = (typeof SERVICE_VALUES)[number];

/** Stored property-type values (database) — never translate these. */
export const PROPERTY_VALUES = [
  'Casa / apartamento',
  'Oficina / edificio corporativo',
  'Tienda / local comercial',
  'Restaurante / hostelería',
  'Industrial / almacén',
  'Otro',
] as const;
export type PropertyValue = (typeof PROPERTY_VALUES)[number];

/** Card copy for one service, shown on the home and services pages. */
export type ServiceCopy = { alt: string; text: string; features: string[] };

export type Dict = typeof es;
export const dictionaries: Record<Lang, Dict> = { es, en };

export function detectLang(): Lang {
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'es' || saved === 'en') return saved; } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Runs before hydration to set <html lang> early (inline script). */
export const LANG_BOOT_SCRIPT = `try{var l=localStorage.getItem('${LANG_KEY}');if(l!=='es'&&l!=='en'){l=(navigator.language||'').toLowerCase().indexOf('es')===0?'es':'en'}document.documentElement.lang=l}catch(e){}`;

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: 'es', t: es, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  // SSR and first client render use Spanish; the real choice is applied after hydration.
  const [lang, setLangState] = useState<Lang>('es');
  useEffect(() => { setLangState(detectLang()); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => { setLangState(l); try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ } }, []);
  return <LangContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>{children}</LangContext.Provider>;
}

export function useI18n() { return useContext(LangContext); }

export function pageTitle(lang: Lang, key: keyof Dict['meta']) { return `${dictionaries[lang].meta[key][0]} | ClearView Solutions`; }

/** Keeps the document title and description in the active language. */
export function usePageMeta(key: keyof Dict['meta']) {
  const { lang } = useI18n();
  useEffect(() => {
    document.title = pageTitle(lang, key);
    document.querySelector('meta[name="description"]')?.setAttribute('content', dictionaries[lang].meta[key][1]);
  }, [lang, key]);
}
