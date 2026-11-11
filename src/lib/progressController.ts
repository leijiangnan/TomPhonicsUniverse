import { readBackup } from "./backup";
import { parseProgress, type Progress } from "./progress";
import { ProgressApi, ProgressConflict, ProgressRequestError, type ProgressSnapshot } from "./progressApi";
import { reconcileRewards } from "./space";

export type ProgressChange = Progress | ((progress: Progress) => Progress);
export type ProgressView = { progress: Progress; confirmedProgress: Progress; ready: boolean; saveError: string };
type Api = Pick<ProgressApi, "load" | "save" | "migrate">;
export class ProgressController {
  view: ProgressView = { progress: parseProgress(null), confirmedProgress: parseProgress(null), ready: false, saveError: "" };
  private revision = 0;
  private dirty = false;
  private queue = Promise.resolve(true);
  private refreshing: Promise<boolean> | undefined;
  constructor(private api: Api, private publish: (view: ProgressView) => void, private legacy: string | null = null) {}
  private update(change: Partial<ProgressView>) { this.view = { ...this.view, ...change }; this.publish(this.view); }
  private accept(snapshot: ProgressSnapshot, saveError = "") {
    this.revision = snapshot.revision; this.dirty = false;
    this.update({ progress: snapshot.progress, confirmedProgress: snapshot.progress, ready: true, saveError });
  }
  private enqueue(action: () => Promise<boolean>) {
    const result = this.queue.then(action, action);
    this.queue = result;
    return result;
  }
  private failure(error: unknown, next?: Progress, durable = false) {
    if (error instanceof ProgressConflict) { this.accept(error.snapshot, error.message); return false; }
    if (!durable && next && (!(error instanceof ProgressRequestError) || error.status >= 500)) {
      this.dirty = true; this.update({ progress: next });
    }
    this.update({ saveError: error instanceof ProgressRequestError && error.status < 500 ? error.message
      : this.view.ready ? "电脑后台连接中断，操作尚未保存。请保持页面打开，连接恢复后会重试；航行和领取须保存成功。"
      : "暂时无法读取电脑上的存档，请检查电脑服务后重新连接。旧记录没有被覆盖。" });
    return false;
  }
  refresh(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;
    const request = this.enqueue(async () => {
      try {
        if (!this.view.ready) {
          let snapshot = await this.api.load();
          let warning = "";
          if (this.legacy) {
            let valid = false;
            try { readBackup(this.legacy); valid = true; } catch { warning = "旧浏览器记录无法自动迁移，后台存档已载入。可在家长面板导入有效备份。"; }
            if (valid) snapshot = await this.api.migrate(this.legacy);
          }
          this.accept(snapshot, warning);
          this.legacy = null;
        } else if (this.dirty) {
          this.accept(await this.api.save(this.view.progress, this.revision));
        } else {
          const snapshot = await this.api.load();
          if (snapshot.revision !== this.revision) this.accept(snapshot);
          else if (this.view.saveError) this.update({ saveError: "" });
        }
        return true;
      } catch (error) { return this.failure(error); }
    });
    this.refreshing = request;
    void request.finally(() => { this.refreshing = undefined; });
    return request;
  }
  change(change: ProgressChange, durable = false): Promise<boolean> {
    return this.enqueue(async () => {
      if (!this.view.ready) return false;
      const next = reconcileRewards(typeof change === "function" ? change(this.view.progress) : change);
      if (next === this.view.progress && !this.dirty) return true;
      try { this.accept(await this.api.save(next, this.revision)); return true; }
      catch (error) { return this.failure(error, next, durable); }
    });
  }
}
