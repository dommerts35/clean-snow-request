import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";
export const LANG_KEY = "clara-lang";

/** Stored service values (database) — never translate these. */
export const SERVICE_VALUES = [
  "Limpieza de ventanas (residencial y comercial)",
  "Lavado a presión",
  "Limpieza de hogar",
  "Limpieza comercial y de negocios",
  "Varios servicios / paquete personalizado",
] as const;
export type ServiceValue = (typeof SERVICE_VALUES)[number];

/** Stored property-type values (database) — never translate these. */
export const PROPERTY_VALUES = [
  "Casa / apartamento",
  "Oficina / edificio corporativo",
  "Tienda / local comercial",
  "Restaurante / hostelería",
  "Industrial / almacén",
  "Otro",
] as const;
export type PropertyValue = (typeof PROPERTY_VALUES)[number];

/** Card copy for one service, shown on the home and services pages. */
export type ServiceCopy = { alt: string; text: string; features: string[] };

const es = {
  skip: "Saltar al contenido",
  nav: {
    home: "Inicio",
    services: "Servicios",
    about: "Nosotros",
    contact: "Contacto",
    panel: "Mi panel",
    login: "Acceder",
    main: "Navegación principal",
    open: "Abrir menú",
    close: "Cerrar menú",
  },
  brandLabel: "ClearView Solutions, inicio",
  brandTag: "Solutions",
  footer: "Cuidamos los detalles. En cada estación.",
  quote: "Solicitar presupuesto",
  dialog: {
    title: "Tu próximo espacio impecable",
    desc: "Cuéntanos qué necesitas para preparar tu solicitud.",
  },
  form: {
    req: "(obligatorio)",
    opt: "(opcional)",
    name: "Nombre",
    namePh: "Tu nombre",
    email: "Correo electrónico",
    emailPh: "tu@correo.com",
    service: "Servicio",
    property: "Tipo de propiedad o negocio",
    address: "Dirección de la propiedad",
    addressPh:
      "Calle y número, ciudad, estado y código postal (p. ej., Av. Principal 123, Guayaquil)",
    location: "Ubicación",
    locationPh: "Ciudad o zona",
    details: "Detalles del proyecto",
    detailsPh:
      "Cuéntanos brevemente sobre tu espacio o negocio (p. ej., número de pisos, tamaño aproximado o frecuencia de limpieza deseada)",
    send: "Enviar solicitud",
    sending: "Enviando…",
    ok: "¡Solicitud enviada! Nuestro equipo te contactará pronto.",
    fail: "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.",
  },
  serviceLabels: {
    "Limpieza de ventanas (residencial y comercial)":
      "Limpieza de ventanas (residencial y comercial)",
    "Lavado a presión": "Lavado a presión",
    "Limpieza de hogar": "Limpieza residencial / de hogar",
    "Limpieza comercial y de negocios": "Limpieza comercial y de negocios",
    "Varios servicios / paquete personalizado": "Varios servicios / paquete personalizado",
  } as Record<ServiceValue, string>,
  propertyLabels: {
    "Casa / apartamento": "Casa / apartamento residencial",
    "Oficina / edificio corporativo": "Oficina / edificio corporativo",
    "Tienda / local comercial": "Tienda / local comercial",
    "Restaurante / hostelería": "Restaurante / hostelería",
    "Industrial / almacén": "Industrial / almacén",
    Otro: "Otro",
  } as Record<PropertyValue, string>,
  services: {
    consult: "Consultar servicio",
    consultLabel: "Consultar servicio: ",
    items: {
      "Limpieza de ventanas (residencial y comercial)": {
        alt: "Profesional limpiando los ventanales de una casa en un día de invierno",
        text: "Más luz, mejores vistas. Cuidamos tus cristales por dentro y por fuera, con atención a cada detalle.",
        features: ["Hogares y negocios", "Interior y exterior"],
      },
      "Lavado a presión": {
        alt: "Trabajador con hidrolavadora limpiando la entrada de concreto de una casa",
        text: "Fachadas, entradas y áreas exteriores como nuevas. Retiramos suciedad, moho y marcas con la presión adecuada para cada superficie.",
        features: ["Entradas y fachadas", "Patios y muros"],
      },
      "Limpieza de hogar": {
        alt: "Persona con guantes limpiando la encimera de una cocina luminosa",
        text: "Tu casa limpia y ordenada, sin que tengas que ocuparte de nada. Nos adaptamos a tus horarios y a la forma en que vives.",
        features: ["Limpieza profunda", "Mantenimiento regular"],
      },
      "Limpieza comercial y de negocios": {
        alt: "Personal de limpieza trapeando el piso de una oficina con muros de cristal",
        text: "Un espacio impecable para tu equipo y tus clientes. Trabajamos en horarios que no interrumpen tu operación.",
        features: ["Oficinas y locales", "Horarios flexibles"],
      },
      "Varios servicios / paquete personalizado": {
        alt: "Trabajador con pala despejando de nieve el camino de entrada a una casa",
        text: "¿Necesitas más de un servicio? Los combinamos en un solo plan y con un solo contacto. Incluye retiro de nieve en invierno.",
        features: ["Un solo presupuesto", "Servicios combinados"],
      },
    } as Record<ServiceValue, ServiceCopy>,
  },
  process: {
    eyebrow: "Así de sencillo",
    title: "Nosotros nos encargamos.",
    l1: "Menos pendientes para ti.",
    l2: "Más cuidado para tu propiedad.",
    steps: [
      ["Cuéntanos qué necesitas", "Cada espacio es diferente. Empezamos por conocer el tuyo."],
      [
        "Encuentra tu solución",
        "Definimos el servicio y una fecha que se ajuste a tus necesidades.",
      ],
      ["Disfruta el resultado", "Ventanas relucientes y accesos despejados, sin complicaciones."],
    ],
  },
  cta: {
    title: "Tu propiedad, en buenas manos.",
    text: "Un nuevo comienzo para tus ventanas. Un camino libre para tu invierno.",
  },
  trust: {
    label: "Nuestro compromiso",
    items: [
      "Cuidado de tu propiedad",
      "Atención al detalle",
      "Limpieza responsable",
      "En cada estación",
    ],
  },
  home: {
    heroAlt: "Limpieza profesional de ventanas en una casa rodeada de nieve",
    eyebrow: "Un espacio cuidado, todo el año",
    h1a: "Ventanas impecables.",
    h1b: "Caminos ",
    h1c: "despejados.",
    rotate: [
      "Caminos despejados.",
      "Hogares relucientes.",
      "Oficinas brillantes.",
      "Fachadas como nuevas.",
    ],
    copy: "Limpieza de ventanas y retiro de nieve para tu hogar o negocio. Tú disfruta tu espacio; nosotros cuidamos el resto.",
    ourServices: "Nuestros servicios",
    note: "Cuéntanos lo que necesitas. Sin compromiso.",
    whatEyebrow: "Lo que hacemos",
    whatTitle: "Cinco servicios. Un mismo cuidado.",
    whatL1: "Deja entrar la luz y deja fuera la nieve.",
    whatL2: "Un solo equipo para todo el año.",
  },
  servicesPage: {
    eyebrow: "Servicios ClearView",
    h1: "Cuidamos tu espacio en cada estación.",
    p: "Cristales que dejan entrar la luz, espacios limpios y accesos despejados. Elige el servicio que necesita tu propiedad o combínalos en un solo plan.",
  },
  about: {
    eyebrow: "El espíritu de ClearView",
    globe: "Con base en New Jersey, cerca de ti.",
    h1: "El cuidado está en los detalles.",
    p: "Creemos que un espacio bien cuidado se siente diferente. Una ventana limpia deja entrar más luz. Un acceso despejado hace más fácil el día.",
    h2a: "Un mismo compromiso, todo el año.",
    pa: "Nos ocupamos de lo que tu propiedad necesita en cada estación: ventanas impecables, espacios interiores limpios y accesos despejados. Trabajamos con atención a tu propiedad y a lo que necesitas, tanto en hogares como en negocios.",
    h2b: "Primero, escucharte.",
    pb: "Cada propiedad tiene sus particularidades. Por eso, queremos conocer tu espacio antes de definir el alcance del trabajo y acordar el servicio contigo.",
  },
  contact: {
    eyebrow: "Hablemos de tu espacio",
    h1: "¿En qué podemos ayudarte?",
    p: "Completa los detalles de tu propiedad y del servicio que buscas para preparar una solicitud de presupuesto.",
  },
  auth: {
    eyebrow: "Área privada",
    login: "Bienvenido de nuevo",
    signup: "Crea tu cuenta",
    intro: "Clientes, trabajadores y administradores entran desde aquí.",
    sent: "Revisa tu correo y confirma tu cuenta para entrar.",
    name: "Nombre",
    email: "Correo electrónico",
    password: "Contraseña",
    doLogin: "Iniciar sesión",
    doSignup: "Crear cuenta",
    or: "o",
    google: "Continuar con Google",
    bad: "Correo o contraseña incorrectos.",
    socialFail: "No se pudo iniciar sesión.",
    toSignup: "¿No tienes cuenta? Regístrate",
    toLogin: "¿Ya tienes cuenta? Inicia sesión",
  },
  notFound: {
    title: "Página no encontrada",
    text: "La página que buscas no existe o se ha movido.",
    home: "Volver al inicio",
  },
  error: {
    title: "Esta página no se pudo cargar",
    text: "Algo salió mal por nuestra parte. Puedes intentarlo de nuevo o volver al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  meta: {
    home: [
      "Limpieza de ventanas y retiro de nieve",
      "Cuidamos tu hogar y negocio en cada estación. Descubre nuestros servicios de limpieza de ventanas y retiro de nieve.",
    ],
    services: [
      "Nuestros servicios",
      "Limpieza de ventanas, lavado a presión, limpieza de hogar y de negocios, y retiro de nieve en Nueva Jersey. Pide tu presupuesto sin compromiso.",
    ],
    about: [
      "Sobre nosotros",
      "Conoce ClearView Solutions: cuidado de tu propiedad, atención al detalle y limpieza de ventanas y retiro de nieve en cada estación.",
    ],
    contact: [
      "Contacto y presupuesto",
      "Prepara tu solicitud de presupuesto para limpieza de ventanas o retiro de nieve con ClearView Solutions.",
    ],
    auth: [
      "Acceder a tu cuenta",
      "Inicia sesión o crea tu cuenta de cliente para ver tus citas y hablar con nuestro equipo.",
    ],
  } as Record<"home" | "services" | "about" | "contact" | "auth", [string, string]>,
};
export type Dict = typeof es;

const en: Dict = {
  skip: "Skip to content",
  nav: {
    home: "Home",
    services: "Services",
    about: "About",
    contact: "Contact",
    panel: "My dashboard",
    login: "Sign in",
    main: "Main navigation",
    open: "Open menu",
    close: "Close menu",
  },
  brandLabel: "ClearView Solutions, home",
  brandTag: "Solutions",
  footer: "Care in every detail. Every season.",
  quote: "Get a free quote",
  dialog: {
    title: "Let’s get your property spotless",
    desc: "Tell us what you need and we’ll put your quote together.",
  },
  form: {
    req: "(required)",
    opt: "(optional)",
    name: "Name",
    namePh: "Your name",
    email: "Email",
    emailPh: "you@example.com",
    service: "Service",
    property: "Property / Business Type",
    address: "Property Address",
    addressPh: "Street address, city, state and ZIP (e.g. 123 Bloomfield Ave, Montclair, NJ 07042)",
    location: "Location",
    locationPh: "Town or area (e.g. Montclair, NJ)",
    details: "Project Details",
    detailsPh:
      "Tell us briefly about your space or business (e.g., number of stories, approximate size, or preferred cleaning frequency)",
    send: "Send request",
    sending: "Sending…",
    ok: "Request sent! Our team will be in touch shortly.",
    fail: "We couldn’t send your request. Please check your connection and try again.",
  },
  serviceLabels: {
    "Limpieza de ventanas (residencial y comercial)": "Window Cleaning (Residential & Commercial)",
    "Lavado a presión": "Power Washing / Pressure Washing",
    "Limpieza de hogar": "Residential / House Cleaning",
    "Limpieza comercial y de negocios": "Commercial & Business Cleaning",
    "Varios servicios / paquete personalizado": "Multiple Services / Custom Package",
  },
  propertyLabels: {
    "Casa / apartamento": "Residential Home / Apartment",
    "Oficina / edificio corporativo": "Office / Corporate Building",
    "Tienda / local comercial": "Retail / Storefront",
    "Restaurante / hostelería": "Restaurant / Hospitality",
    "Industrial / almacén": "Industrial / Warehouse",
    Otro: "Other",
  },
  services: {
    consult: "Learn more",
    consultLabel: "Ask about: ",
    items: {
      "Limpieza de ventanas (residencial y comercial)": {
        alt: "Professional cleaning the large windows of a home on a winter day",
        text: "More light, better views. We clean your glass inside and out, with care for every detail.",
        features: ["Homes and businesses", "Interior and exterior"],
      },
      "Lavado a presión": {
        alt: "Worker pressure washing a concrete driveway and the lower wall of a house",
        text: "Driveways, facades and outdoor areas looking new again. We lift dirt, mildew and stains with the right pressure for each surface.",
        features: ["Driveways and facades", "Patios and walls"],
      },
      "Limpieza de hogar": {
        alt: "Cleaner in gloves wiping down a bright kitchen counter",
        text: "A clean, tidy home without you having to lift a finger. We work around your schedule and the way you live.",
        features: ["Deep cleaning", "Regular upkeep"],
      },
      "Limpieza comercial y de negocios": {
        alt: "Commercial cleaner mopping the floor of an office with glass walls",
        text: "A spotless space for your team and your customers, on hours that don’t get in the way of your business.",
        features: ["Offices and storefronts", "Flexible scheduling"],
      },
      "Varios servicios / paquete personalizado": {
        alt: "Worker shoveling snow from the front walkway of a house",
        text: "Need more than one service? We combine them into a single plan with one point of contact, including snow removal in winter.",
        features: ["One quote", "Combined services"],
      },
    },
  },
  process: {
    eyebrow: "Simple as that",
    title: "We take care of it.",
    l1: "Less on your to-do list.",
    l2: "More care for your property.",
    steps: [
      ["Tell us what you need", "Every property is different. We start by getting to know yours."],
      ["Get the right plan", "We set the service and a date that fits your schedule."],
      ["Enjoy the results", "Sparkling windows and clear paths, hassle-free."],
    ],
  },
  cta: {
    title: "Your property, in good hands.",
    text: "A fresh start for your windows. A clear path through winter.",
  },
  trust: {
    label: "Our promise",
    items: [
      "We respect your property",
      "Attention to detail",
      "Eco-conscious cleaning",
      "Year-round service",
    ],
  },
  home: {
    heroAlt: "Professional window cleaning at a snow-covered home",
    eyebrow: "A well-kept property, all year",
    h1a: "Spotless windows.",
    h1b: "Clear ",
    h1c: "paths.",
    rotate: ["Clear paths.", "Sparkling homes.", "Gleaming offices.", "Like-new driveways."],
    copy: "Window cleaning and snow removal for homes and businesses across New Jersey. You enjoy your space; we handle the rest.",
    ourServices: "Our services",
    note: "Tell us what you need. No obligation.",
    whatEyebrow: "What we do",
    whatTitle: "Five services. The same care.",
    whatL1: "Let the light in and keep the snow out.",
    whatL2: "One team for the whole year.",
  },
  servicesPage: {
    eyebrow: "ClearView services",
    h1: "Caring for your property, every season.",
    p: "Glass that lets the light in, spaces kept clean and paths kept clear. Choose what your property needs, or combine services in one plan.",
  },
  about: {
    eyebrow: "The ClearView way",
    globe: "Based in New Jersey, close to you.",
    h1: "Care is in the details.",
    p: "We believe a well-kept space simply feels better. A clean window lets in more light. A clear walkway makes the day easier.",
    h2a: "One commitment, all year long.",
    pa: "We take care of what your property needs in every season: spotless windows, clean indoor spaces and clear outdoor paths. We work with care for your property and your needs, for homes and businesses alike.",
    h2b: "First, we listen.",
    pb: "Every property is unique. That’s why we get to know yours before we scope the work and agree on the service with you.",
  },
  contact: {
    eyebrow: "Let’s talk about your property",
    h1: "How can we help?",
    p: "Share a few details about your property and the service you need, and we’ll prepare your quote.",
  },
  auth: {
    eyebrow: "Account area",
    login: "Welcome back",
    signup: "Create your account",
    intro: "Clients, staff and administrators sign in here.",
    sent: "Check your email and confirm your account to sign in.",
    name: "Name",
    email: "Email",
    password: "Password",
    doLogin: "Sign in",
    doSignup: "Create account",
    or: "or",
    google: "Continue with Google",
    bad: "Incorrect email or password.",
    socialFail: "We couldn’t sign you in.",
    toSignup: "Don’t have an account? Sign up",
    toLogin: "Already have an account? Sign in",
  },
  notFound: {
    title: "Page not found",
    text: "The page you’re looking for doesn’t exist or has moved.",
    home: "Back to home",
  },
  error: {
    title: "This page couldn’t load",
    text: "Something went wrong on our end. You can try again or head back home.",
    retry: "Try again",
    home: "Back to home",
  },
  meta: {
    home: [
      "Window Cleaning & Snow Removal in New Jersey",
      "Year-round care for your home or business. Professional window cleaning and snow removal across New Jersey.",
    ],
    services: [
      "Our Services",
      "Window cleaning, power washing, house and commercial cleaning, and snow removal across New Jersey. Request a free quote.",
    ],
    about: [
      "About Us",
      "Meet ClearView Solutions: respect for your property, attention to detail, and window cleaning and snow removal every season.",
    ],
    contact: [
      "Contact & Free Quote",
      "Request a free quote for window cleaning or snow removal from ClearView Solutions.",
    ],
    auth: [
      "Sign In to Your Account",
      "Sign in or create a client account to see your appointments and chat with our team.",
    ],
  },
};

export const dictionaries: Record<Lang, Dict> = { es, en };

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language || "" : "";
  return nav.toLowerCase().startsWith("es") ? "es" : "en";
}

/** Runs before hydration to set <html lang> early (inline script). */
export const LANG_BOOT_SCRIPT = `try{var l=localStorage.getItem('${LANG_KEY}');if(l!=='es'&&l!=='en'){l=(navigator.language||'').toLowerCase().indexOf('es')===0?'es':'en'}document.documentElement.lang=l}catch(e){}`;

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "es", t: es, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  // SSR and first client render use Spanish; the real choice is applied after hydration.
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    setLangState(detectLang());
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <LangContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  return useContext(LangContext);
}

export function pageTitle(lang: Lang, key: keyof Dict["meta"]) {
  return `${dictionaries[lang].meta[key][0]} | ClearView Solutions`;
}

/** Keeps the document title and description in the active language. */
export function usePageMeta(key: keyof Dict["meta"]) {
  const { lang } = useI18n();
  useEffect(() => {
    document.title = pageTitle(lang, key);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dictionaries[lang].meta[key][1]);
  }, [lang, key]);
}
