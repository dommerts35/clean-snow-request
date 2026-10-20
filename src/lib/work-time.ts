export type DemoLocation = { label: string; lat: number; lng: number };

/** Ubicaciones de prueba usadas al fichar (no se pide la ubicación real). */
export const DEMO_LOCATIONS: DemoLocation[] = [
  { label: "Oficina central", lat: 45.5019, lng: -73.5674 },
  { label: "Residencial Los Pinos", lat: 45.5231, lng: -73.5817 },
  { label: "Centro comercial Norte", lat: 45.5582, lng: -73.6512 },
  { label: "Edificio Mirador", lat: 45.4972, lng: -73.5794 },
  { label: "Casa familia Gómez", lat: 45.5361, lng: -73.6105 },
];

export function pickDemoLocation(index: number): DemoLocation {
  const n = DEMO_LOCATIONS.length;
  return DEMO_LOCATIONS[((index % n) + n) % n]!;
}

/** Minutos trabajados en un fichaje; si sigue abierto, cuenta hasta `now`. */
export function workedMinutes(clockIn: string | Date, clockOut: string | Date | null, now: Date = new Date()): number {
  const start = new Date(clockIn).getTime();
  const end = clockOut ? new Date(clockOut).getTime() : now.getTime();
  return Math.max(0, Math.floor((end - start) / 60000));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export function totalMinutes(entries: { clock_in: string; clock_out: string | null }[], now: Date = new Date()): number {
  return entries.reduce((sum, e) => sum + workedMinutes(e.clock_in, e.clock_out, now), 0);
}
