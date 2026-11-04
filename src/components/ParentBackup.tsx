import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { backupSummary, createBackup, MAX_BACKUP_BYTES, readBackup } from "../lib/backup";
import { downloadText } from "../lib/download";
import { audioReviewCsv } from "../data/audioReview";
import type { Progress } from "../lib/progress";

export function ParentBackup({ progress, previewEnabled, onImport }: {
  progress: Progress; previewEnabled: boolean; onImport: (progress: Progress) => Promise<boolean>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const summary = pending && backupSummary(pending);
  return <section className="backup-controls" aria-label="存档备份和素材校对">
    <h3>本机存档备份</h3><p>导出学习、探索和复习记录。导入会替换当前存档，建议先导出备份。录音不在存档中。</p>
    <div className="backup-buttons">
      <button className="button secondary" onClick={() => { downloadText(createBackup(progress), "tom-phonics-backup.json"); setMessage("已交给浏览器下载，请确认文件已保存。"); }}><Download size={19} />导出当前存档</button>
      <button className="button secondary" disabled={previewEnabled || busy} onClick={() => { setError(""); setMessage(""); input.current?.click(); }}><Upload size={19} />选择存档导入</button>
    </div>
    {previewEnabled && <p>关闭家长预览后可导入。导出的始终是正式存档。</p>}
    <input ref={input} type="file" accept=".json,application/json" aria-label="选择 JSON 存档" hidden onChange={async (event) => {
      const file = event.target.files?.[0]; event.target.value = ""; setPending(null); setError("");
      if (!file) return;
      try {
        if (file.size > MAX_BACKUP_BYTES) throw new Error("存档文件过大，请选择本站导出的 JSON 存档。");
        setPending(readBackup(await file.text()));
      } catch (failure) { setError(failure instanceof Error ? failure.message : "存档读取失败，当前进度没有改变。"); }
    }} />
    {pending && summary && <div className="backup-preview" aria-label="待导入存档摘要">
      <b>请核对待导入记录</b><dl><div><dt>已完成</dt><dd>{summary.completedCourses} 课</dd></div><div><dt>正在查看</dt><dd>第 {summary.lesson} 课</dd></div><div><dt>燃料</dt><dd>{summary.fuel}</dd></div></dl>
      <p>复习观察 {summary.observations} 条。确认后覆盖当前学习与探索记录。</p>
      <div className="backup-buttons"><button className="button secondary" disabled={busy} onClick={() => setPending(null)}>取消导入</button><button className="button primary" disabled={previewEnabled || busy} onClick={async () => {
        setBusy(true); setError(""); setMessage("");
        try {
          if (await onImport(pending)) { setPending(null); setMessage("存档已导入并保存。"); }
          else setError("本次导入未提交，请查看保存提示后重试。");
        } finally { setBusy(false); }
      }}>{busy ? "正在保存…" : "确认替换当前存档"}</button></div>
    </div>}
    {error && <p className="backup-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <details className="audio-review-tools"><summary>教学音频校对</summary><p>字母音包含用户提供的素材，其余多为合成试听音。尚未完成人工发音验收；清单留有审核人与替换记录栏。</p><button className="button secondary" onClick={() => downloadText(audioReviewCsv(), "tom-audio-review.csv", "text/csv;charset=utf-8")}><Download size={19} />导出音频校对清单</button></details>
    {!window.isSecureContext && <p>当前连接不支持安全录音。iPad 使用麦克风需要 HTTPS；仍可由家长确认口语。</p>}
  </section>;
}
