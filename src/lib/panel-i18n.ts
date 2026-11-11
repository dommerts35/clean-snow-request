import { es as esLocale, enUS } from "date-fns/locale";
import { useI18n, type Lang } from "@/lib/i18n";
import type { Role } from "@/hooks/use-account";

const es = {
  loading: "Cargando…", signOut: "Salir", hello: (n: string) => `Hola, ${n}`, welcome: "bienvenido",
  roles: { admin: "Administrador", worker: "Trabajador", client: "Cliente" } as Record<Role, string>,
  tabs: { calendar: "Calendario", support: "Servicio al cliente", chat: "Chat", requests: "Solicitudes", stats: "Estadísticas", clock: "Fichaje", users: "Cuentas" },
  cal: {
    newAppt: "Nueva cita", pickDay: "Selecciona un día", noneToday: "No hay citas este día.", upcoming: "Próximas citas", noneUpcoming: "No hay citas programadas.",
    dayFmt: "EEEE d 'de' MMMM", shortFmt: "d MMM, HH:mm",
    confirmDelete: "¿Quieres eliminar esta cita?", deleteFail: "No pudimos eliminar la cita.", deleted: "Cita eliminada", deleteLabel: "Eliminar cita",
    worker: "Trabajador", client: "Cliente", created: "Cita creada", createFail: "No pudimos crear la cita.", noClients: "Todavía no hay clientes registrados.",
    service: "Servicio", date: "Fecha", time: "Hora", minutes: "Minutos", address: "Dirección", addressPh: "Calle, número, ciudad", notes: "Notas", save: "Guardar cita",
    status: { programada: "Programada", completada: "Completada", cancelada: "Cancelada" } as Record<string, string>,
    services: { "Limpieza de ventanas": "Limpieza de ventanas", "Retiro de nieve": "Retiro de nieve", "Ambos servicios": "Ambos servicios" } as Record<string, string>,
  },
  chat: {
    team: "Equipo ClearView", you: "Tú", clients: "Clientes", noClients: "Todavía no hay clientes.", noMessages: "Sin mensajes", unread: (n: string) => `${n} sin leer`,
    with: (n: string) => `Conversación con ${n}`, pickClient: "Elige un cliente", support: "Servicio al cliente", empty: "Todavía no hay mensajes.",
    clientIntro: "Escríbenos y nuestro asistente te responde al instante; si hace falta, alguien del equipo sigue la conversación.",
    ai: "Asistente IA", aiBadge: "IA", typing: "El asistente está escribiendo", placeholder: "Escribe un mensaje…", send: "Enviar",
  },
  clock: {
    working: "Trabajando ahora", off: "Fuera de turno", inAt: (t: string, l: string) => `Entrada a las ${t} · ${l}`, hint: "Marca tu entrada cuando empieces a trabajar.",
    demo: "La ubicación es de prueba y se asigna automáticamente.", clockOut: "Marcar salida", clockIn: "Marcar entrada",
    outOk: "Salida registrada", inOk: "Entrada registrada", fail: "No pudimos registrar el fichaje.",
    team: "Fichajes del equipo", mine: "Mis fichajes", total: "total", none: "Todavía no hay fichajes.",
    worker: "Trabajador", date: "Fecha", in: "Entrada", out: "Salida", time: "Tiempo", ongoing: "En curso", dateFmt: "d MMM",
  },
  stats: { upcoming: "Próximas citas", done: "Citas realizadas", weekHours: "Horas esta semana", totalHours: "Horas totales", clients: "Clientes", workers: "Trabajadores",
    byService: "Citas por servicio", byWorker: "Horas por trabajador", noData: "Todavía no hay datos.", hours: "Horas", total: "Total" },
  users: { title: "Cuentas", intro: "Las cuentas nuevas entran como clientes. Desde aquí puedes cambiarlas a trabajador o administrador.",
    name: "Nombre", email: "Correo", role: "Rol", roleFail: "No pudimos cambiar el rol.", roleOk: "Rol actualizado",
    confirm: (n: string) => `¿Eliminar la cuenta de ${n || "este usuario"}? Se borrarán sus citas, mensajes y fichajes.`,
    delFail: "No pudimos eliminar la cuenta.", delOk: "Cuenta eliminada", delLabel: "Eliminar cuenta" },
  req: { title: "Solicitudes de presupuesto", none: "Todavía no hay solicitudes.", updateFail: "No pudimos actualizar la solicitud.", confirm: "¿Quieres eliminar esta solicitud?",
    delFail: "No pudimos eliminar la solicitud.", delOk: "Solicitud eliminada", del: "Eliminar", dateFmt: "d MMM yyyy, HH:mm", statusLabel: "Estado",
    status: { nueva: "Nueva", contactada: "Contactada", cerrada: "Cerrada" } as Record<string, string> },
};
export type PanelDict = typeof es;

const en: PanelDict = {
  loading: "Loading…", signOut: "Sign out", hello: (n) => `Hi, ${n}`, welcome: "welcome",
  roles: { admin: "Administrator", worker: "Worker", client: "Client" },
  tabs: { calendar: "Calendar", support: "Customer service", chat: "Chat", requests: "Requests", stats: "Stats", clock: "Time clock", users: "Accounts" },
  cal: {
    newAppt: "New appointment", pickDay: "Select a day", noneToday: "No appointments this day.", upcoming: "Upcoming appointments", noneUpcoming: "No appointments scheduled.",
    dayFmt: "EEEE, MMMM d", shortFmt: "MMM d, h:mm a",
    confirmDelete: "Delete this appointment?", deleteFail: "We couldn’t delete the appointment.", deleted: "Appointment deleted", deleteLabel: "Delete appointment",
    worker: "Worker", client: "Client", created: "Appointment created", createFail: "We couldn’t create the appointment.", noClients: "No clients have signed up yet.",
    service: "Service", date: "Date", time: "Time", minutes: "Minutes", address: "Address", addressPh: "Street, number, city", notes: "Notes", save: "Save appointment",
    status: { programada: "Scheduled", completada: "Completed", cancelada: "Canceled" },
    services: { "Limpieza de ventanas": "Window cleaning", "Retiro de nieve": "Snow removal", "Ambos servicios": "Both services" },
  },
  chat: {
    team: "ClearView Team", you: "You", clients: "Clients", noClients: "No clients yet.", noMessages: "No messages", unread: (n) => `${n} unread`,
    with: (n) => `Conversation with ${n}`, pickClient: "Choose a client", support: "Customer service", empty: "No messages yet.",
    clientIntro: "Send us a message and our assistant will reply right away; if needed, someone from our team will pick up the conversation.",
    ai: "AI Assistant", aiBadge: "AI", typing: "The assistant is typing", placeholder: "Type a message…", send: "Send",
  },
  clock: {
    working: "Working now", off: "Off the clock", inAt: (t, l) => `Clocked in at ${t} · ${l}`, hint: "Clock in when you start working.",
    demo: "Location is demo data and assigned automatically.", clockOut: "Clock out", clockIn: "Clock in",
    outOk: "Clocked out", inOk: "Clocked in", fail: "We couldn’t record your time.",
    team: "Team time entries", mine: "My time entries", total: "total", none: "No time entries yet.",
    worker: "Worker", date: "Date", in: "In", out: "Out", time: "Time", ongoing: "In progress", dateFmt: "MMM d",
  },
  stats: { upcoming: "Upcoming appointments", done: "Completed appointments", weekHours: "Hours this week", totalHours: "Total hours", clients: "Clients", workers: "Workers",
    byService: "Appointments by service", byWorker: "Hours by worker", noData: "No data yet.", hours: "Hours", total: "Total" },
  users: { title: "Accounts", intro: "New sign-ups start as clients. Change them to worker or administrator here.",
    name: "Name", email: "Email", role: "Role", roleFail: "We couldn’t change the role.", roleOk: "Role updated",
    confirm: (n) => `Delete ${n ? `${n}’s account` : "this account"}? Their appointments, messages and time entries will be removed.`,
    delFail: "We couldn’t delete the account.", delOk: "Account deleted", delLabel: "Delete account" },
  req: { title: "Quote requests", none: "No requests yet.", updateFail: "We couldn’t update the request.", confirm: "Delete this request?",
    delFail: "We couldn’t delete the request.", delOk: "Request deleted", del: "Delete", dateFmt: "MMM d, yyyy, h:mm a", statusLabel: "Status",
    status: { nueva: "New", contactada: "Contacted", cerrada: "Closed" } },
};

const dicts: Record<Lang, PanelDict> = { es, en };
export const DATE_LOCALES = { es: esLocale, en: enUS };
/** Time-of-day pattern per language (24 h in Spanish, 12 h in US English). */
export const TIME_FMT: Record<Lang, string> = { es: "HH:mm", en: "h:mm a" };
export const INTL_LOCALE: Record<Lang, string> = { es: "es-US", en: "en-US" };

export function formatCurrency(amount: number, lang: Lang, currency = "USD") {
  return new Intl.NumberFormat(INTL_LOCALE[lang], { style: "currency", currency }).format(amount);
}

export function usePanelI18n() {
  const { lang, t, setLang } = useI18n();
  return { lang, p: dicts[lang], t, setLang, locale: DATE_LOCALES[lang], timeFmt: TIME_FMT[lang] };
}
