import { describe, it, expect } from "vitest";
import { unreadByConversation, badgeLabel } from "@/lib/unread";
const m = (c: string, s: string | null, t: string) => ({ client_id: c, sender_id: s, created_at: t });
describe("unread", () => {
  it("ignores own messages and ones before last read", () => {
    const r = unreadByConversation([m("c", "me", "2026-01-01T10:00Z"), m("c", "x", "2026-01-01T09:00Z"), m("c", "x", "2026-01-01T11:00Z"), m("d", null, "2026-01-01T11:00Z")], [{ client_id: "c", last_read_at: "2026-01-01T10:00Z" }], "me");
    expect(r).toEqual({ c: 1, d: 1 });
  });
  it("badge hides at 0 and caps at 99+", () => {
    expect(badgeLabel(0)).toBeNull(); expect(badgeLabel(99)).toBe("99"); expect(badgeLabel(100)).toBe("99+");
  });
});
