import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { progressMiddleware } from "./progressPlugin";
import { ProgressStore } from "./progressStore";
let dir: string, store: ProgressStore, server: Server, base: string;
beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "tom-progress-http-")); store = new ProgressStore(join(dir, "progress.sqlite"));
  const handler = progressMiddleware(() => store);
  server = createServer((req, res) => { void handler(req, res, () => { res.writeHead(404); res.end(); }); });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterEach(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); store.close(); rmSync(dir, { recursive: true, force: true }); });
const send = (path: string, value: unknown, extra = {}) => fetch(base + path, { method: "PUT", headers: { "Content-Type": "application/json", ...extra }, body: JSON.stringify(value) });
describe("progress HTTP contract", () => {
  it("returns uncached shared data and atomically rejects stale clients", async () => {
    const read = await fetch(base + "/api/progress"); expect(read.headers.get("cache-control")).toBe("no-store");
    const original = await read.json(); const saved = await send("/api/progress", { ...original, progress: { ...original.progress, volume: 0.3 } });
    expect(saved.status).toBe(200);
    const conflict = await send("/api/progress", original); expect(conflict.status).toBe(409);
    expect((await conflict.json()).snapshot.progress.volume).toBe(0.3);
  });
  it("rejects malformed and cross-site writes without changing the shared record", async () => {
    expect((await send("/api/progress", {})).status).toBe(400);
    expect((await send("/api/progress", {}, { Origin: "http://other.invalid" })).status).toBe(403);
    expect((await send("/api/progress", {}, { Origin: base.replace("http:", "https:") })).status).toBe(403);
    expect((await send("/api/progress", {}, { "Sec-Fetch-Site": "cross-site" })).status).toBe(403);
    expect(store.read().revision).toBe(0);
  });
  it("enforces body limits and handles unknown methods and routes", async () => {
    expect((await send("/api/progress", { padding: "a".repeat(2_000_001) })).status).toBe(413);
    expect((await fetch(base + "/api/progress", { method: "DELETE" })).status).toBe(405);
    expect((await fetch(base + "/other")).status).toBe(404);
  });
  it("accepts idempotent legacy migration through the real endpoint", async () => {
    const legacy = JSON.stringify(store.read().progress);
    const migrate = () => fetch(base + "/api/progress/migrate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ legacy }) });
    const a = await (await migrate()).json(), b = await (await migrate()).json();
    expect(a.revision).toBe(1); expect(b).toEqual(a);
  });
});
