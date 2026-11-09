import { es } from './locales/es';
import { en } from './locales/en';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isLocale, resolveLocale } from './locale-utils';

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
  const userId = useRef<string | null>(null);
  const version = useRef(0);
  const saves = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => { setLangState(detectLang()); }, []);
  useEffect(() => {
    let alive = true;
    async function loadPreference(id: string | null) {
      userId.current = id;
      const current = ++version.current;
      if (!id) return;
      const { data, error } = await supabase.from('profiles').select('preferred_language').eq('id', id).maybeSingle();
      if (!alive || version.current !== current || error) return;
      const selected = resolveLocale(detectLang(), '', data?.preferred_language);
      setLangState(selected);
      try { localStorage.setItem(LANG_KEY, selected); } catch { /* device storage unavailable */ }
    }
    void supabase.auth.getUser().then(({ data }) => { if (alive) void loadPreference(data.user?.id ?? null); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { userId.current = null; version.current++; }
      if (event === 'SIGNED_IN' && session?.user.id !== userId.current) {
        const id = session?.user.id ?? null;
        // Run queries outside the auth callback lock.
        queueMicrotask(() => { if (alive) void loadPreference(id); });
      }
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    if (!isLocale(l)) return;
    version.current++;
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
    const id = userId.current;
    if (id) saves.current = saves.current.catch(() => {}).then(async () => {
      const { data, error } = await supabase.from('profiles').update({ preferred_language: l }).eq('id', id).select('id');
      if (error || !data?.length) toast.error(dictionaries[l].account.common.languageSaveFail);
    });
  }, []);
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
