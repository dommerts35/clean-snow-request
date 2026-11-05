import { describe, expect, it } from "vitest";
import { shouldReply } from "@/lib/assistant-rules";

const now = new Date("2026-01-01T12:00:00Z");
const at = (minAgo: number) => new Date(now.getTime() - minAgo * 60_000).toISOString();

describe("assistant handoff", () => {
  it("replies when the client wrote last and no staff is active", () => {
    expect(shouldReply([{ sender_id: "c", is_ai: false, created_at: at(0) }], "c", now).ok).toBe(true);
  });
  it("stays silent if staff wrote within 30 minutes", () => {
    const h = [{ sender_id: "w", is_ai: false, created_at: at(29) }, { sender_id: "c", is_ai: false, created_at: at(0) }];
    expect(shouldReply(h, "c", now)).toEqual({ ok: false, reason: "human_active" });
  });
  it("resumes after 30 minutes of staff silence", () => {
    const h = [{ sender_id: "w", is_ai: false, created_at: at(31) }, { sender_id: "c", is_ai: false, created_at: at(0) }];
    expect(shouldReply(h, "c", now).ok).toBe(true);
  });
});
