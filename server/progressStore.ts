import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { readBackup } from "../src/lib/backup";
import { parseProgress, type Progress } from "../src/lib/progress";
import { ProgressConflict, type ProgressSnapshot } from "../src/lib/progressApi";
import { mergeLegacyProgress } from "./mergeLegacy";

export class ProgressStore {
  private db: DatabaseSync;
  constructor(file: string) {
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(file);
    try { this.db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS legacy_sources (fingerprint TEXT PRIMARY KEY, original TEXT NOT NULL, migrated_at TEXT NOT NULL);`); }
    catch (error) { this.db.close(); throw error; }
  }
  close() { this.db.close(); }
  read(): ProgressSnapshot {
    const row = this.db.prepare("SELECT revision, data FROM progress WHERE id=1").get();
    return row ? { revision: Number(row.revision), progress: readBackup(String(row.data)) }
      : { revision: 0, progress: parseProgress(null) };
  }
  private transaction<T>(action: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try { const result = action(); this.db.exec("COMMIT"); return result; }
    catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  private write(progress: Progress, revision: number): ProgressSnapshot {
    const clean = readBackup(JSON.stringify(progress));
    this.db.prepare("INSERT INTO progress(id, revision, data) VALUES(1, ?, ?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, data=excluded.data")
      .run(revision, JSON.stringify(clean));
    return { revision, progress: clean };
  }
  save(progress: Progress, revision: number) {
    return this.transaction(() => {
      const current = this.read();
      if (current.revision !== revision) throw new ProgressConflict(current);
      return this.write(progress, revision + 1);
    });
  }
  migrate(original: string) {
    const legacy = readBackup(original);
    const fingerprint = createHash("sha256").update(original).digest("hex");
    return this.transaction(() => {
      const current = this.read();
      if (this.db.prepare("SELECT 1 FROM legacy_sources WHERE fingerprint=?").get(fingerprint)) return current;
      const result = this.write(current.revision === 0 ? legacy : mergeLegacyProgress(current.progress, legacy), current.revision + 1);
      this.db.prepare("INSERT INTO legacy_sources VALUES(?, ?, ?)").run(fingerprint, original, new Date().toISOString());
      return result;
    });
  }
}
