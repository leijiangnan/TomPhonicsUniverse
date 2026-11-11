import { readBackup } from "./backup";
import type { Progress } from "./progress";

export type ProgressSnapshot = { revision: number; progress: Progress };
export class ProgressConflict extends Error {
  constructor(public snapshot: ProgressSnapshot) { super("另一台设备更新了进度，已载入最新记录，请再试一次。"); }
}
export class ProgressRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function snapshot(value: unknown): ProgressSnapshot {
  const data = value as Partial<ProgressSnapshot> | null;
  if (!data || !Number.isSafeInteger(data.revision) || Number(data.revision) < 0 || !data.progress)
    throw new Error("后台返回的存档无效，请重试。");
  return { revision: data.revision!, progress: readBackup(JSON.stringify(data.progress)) };
}
export class ProgressApi {
  constructor(private request: typeof fetch = (...args) => fetch(...args)) {}
  private async call(method: string, body?: unknown): Promise<ProgressSnapshot> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const encoded = body === undefined ? undefined : JSON.stringify(body);
    try {
      const response = await this.request(method === "POST" ? "/api/progress/migrate" : "/api/progress", {
        method, cache: "no-store", credentials: "same-origin", signal: controller.signal,
        keepalive: method === "PUT" && new TextEncoder().encode(encoded).length < 60000,
        ...(encoded === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: encoded }),
      });
      const data = await response.json();
      if (response.status === 409) throw new ProgressConflict(snapshot(data.snapshot));
      if (!response.ok) throw new ProgressRequestError(response.status, data.error || "电脑后台暂时无法保存，请重试。");
      return snapshot(data);
    } finally { clearTimeout(timeout); }
  }
  load() { return this.call("GET"); }
  save(progress: Progress, revision: number) { return this.call("PUT", { revision, progress }); }
  migrate(legacy: string) { return this.call("POST", { legacy }); }
}
