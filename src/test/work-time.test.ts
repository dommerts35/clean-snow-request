import { describe, expect, it } from "vitest";
import { formatDuration, totalMinutes, workedMinutes } from "@/lib/work-time";

describe("tiempo trabajado", () => {
  it("calcula minutos entre entrada y salida", () => {
    expect(workedMinutes("2026-01-01T08:00:00Z", "2026-01-01T12:30:00Z")).toBe(270);
  });
  it("un fichaje abierto cuenta hasta ahora", () => {
    expect(workedMinutes("2026-01-01T08:00:00Z", null, new Date("2026-01-01T09:15:00Z"))).toBe(75);
  });
  it("suma varios fichajes", () => {
    expect(totalMinutes([
      { clock_in: "2026-01-01T08:00:00Z", clock_out: "2026-01-01T10:00:00Z" },
      { clock_in: "2026-01-02T08:00:00Z", clock_out: "2026-01-02T09:30:00Z" },
    ])).toBe(210);
    expect(formatDuration(210)).toBe("3 h 30 min");
  });
});
