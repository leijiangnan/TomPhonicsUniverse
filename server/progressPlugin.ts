import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { readBackup } from "../src/lib/backup";
import { ProgressConflict } from "../src/lib/progressApi";
import { ProgressStore } from "./progressStore";

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function reply(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}
async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (req.headers["sec-fetch-site"] === "cross-site") throw new HttpError(403, "不允许跨站修改存档。");
  if (req.headers.origin) {
    let origin: URL;
    try { origin = new URL(req.headers.origin); } catch { throw new HttpError(403, "请求来源无效。"); }
    const protocol = (req.socket as { encrypted?: boolean }).encrypted ? "https:" : "http:";
    if (origin.host !== req.headers.host || origin.protocol !== protocol) throw new HttpError(403, "不允许跨源修改存档。");
  }
  if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json") throw new HttpError(400, "请使用 JSON 请求。");
  let length = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 2_000_000) throw new HttpError(413, "请求过大，存档未改变。");
    chunks.push(Buffer.from(chunk));
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new HttpError(400, "JSON 格式无效。"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "请求格式无效。");
  return value as Record<string, unknown>;
}
export function progressMiddleware(getStore: () => ProgressStore) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/progress" && path !== "/api/progress/migrate") return next();
    try {
      if (path === "/api/progress" && req.method === "GET") return reply(res, 200, getStore().read());
      if ((path === "/api/progress" && req.method === "PUT") || (path === "/api/progress/migrate" && req.method === "POST")) {
        const value = await body(req);
        if (path.endsWith("/migrate")) {
          if (typeof value.legacy !== "string") throw new HttpError(400, "缺少旧存档。");
          try { readBackup(value.legacy); } catch (error) { throw new HttpError(400, (error as Error).message); }
          return reply(res, 200, getStore().migrate(value.legacy));
        }
        if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 0) throw new HttpError(400, "存档版本无效。");
        let progress;
        try { progress = readBackup(JSON.stringify(value.progress)); } catch (error) { throw new HttpError(400, (error as Error).message); }
        return reply(res, 200, getStore().save(progress, Number(value.revision)));
      }
      return reply(res, 405, { error: "请求方法不受支持。" });
    } catch (error) {
      if (error instanceof ProgressConflict) return reply(res, 409, { error: error.message, snapshot: error.snapshot });
      if (error instanceof HttpError) return reply(res, error.status, { error: error.message });
      console.error("[progress] 后台存档操作失败", error);
      return reply(res, 503, { error: "电脑后台暂时无法读取或保存存档，请保持页面打开并重试。" });
    }
  };
}
export function progressPlugin(): Plugin {
  let file: string;
  let store: ProgressStore | undefined;
  const middleware = progressMiddleware(() => store ??= new ProgressStore(file));
  return { name: "tom-phonics-progress", configResolved(config) {
    file = resolve(config.root, process.env.TOM_PHONICS_DATA_DIR || ".data", "progress.sqlite");
  }, configureServer(server) {
    server.middlewares.use(middleware);
    server.httpServer?.once("close", () => { store?.close(); store = undefined; });
  }, configurePreviewServer(server) {
    server.middlewares.use(middleware);
    server.httpServer.once("close", () => { store?.close(); store = undefined; });
  } };
}
