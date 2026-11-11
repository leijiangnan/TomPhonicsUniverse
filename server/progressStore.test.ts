import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lessons } from "../src/data/lesson";
import { parseProgress, selectCourse, type Progress } from "../src/lib/progress";
import { reconcileRewards, travel, fuel, confirmStation } from "../src/lib/space";
import { startPractice, observePractice } from "../src/lib/practice";
import { readBackup } from "../src/lib/backup";
import { newDialogue } from "../src/lib/dialogue";
import { ProgressConflict } from "../src/lib/progressApi";
import { ProgressStore } from "./progressStore";
import { mergeLegacyProgress } from "./mergeLegacy";

const directories: string[] = [], stores: ProgressStore[] = [];
function database() {
  const dir = mkdtempSync(join(tmpdir(), "tom-phonics-test-")); directories.push(dir);
  const file = join(dir, "progress.sqlite");
  const store = new ProgressStore(file); stores.push(store);
  return { store, file };
}
function completed(count: number) {
  let p = parseProgress(null);
  for (let n = 0; n < count; n++) {
    p = reconcileRewards({ ...p, completed: lessons[n].steps.map((_, i) => i),
      blendCompleted: lessons[n].blendRounds.map((_, i) => i), speakingCompleted: true });
    if (n + 1 < lessons.length) p = selectCourse(p, n + 1);
  }
  return p;
}
afterEach(() => {
  for (const store of stores.splice(0)) store.close();
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true });
});
describe("computer-backed shared progress", () => {
  it("starts at revision zero and persists across independent database connections", () => {
    const { store, file } = database();
    expect(store.read().revision).toBe(0);
    const saved = store.save(completed(3), 0);
    const reopened = new ProgressStore(file); stores.push(reopened);
    expect(reopened.read()).toEqual(saved);
    expect(reopened.read().progress.lessonIndex).toBe(3);
  });
  it("rejects a second device's stale revision without overwriting newer progress", () => {
    const { store, file } = database();
    const second = new ProgressStore(file); stores.push(second);
    const stale = second.read();
    const latest = store.save(completed(3), stale.revision);
    expect(() => second.save(completed(1), stale.revision)).toThrow(ProgressConflict);
    expect(second.read()).toEqual(latest);
  });
  it.each([false, true])("merges second/fourth-lesson legacy records in either arrival order (%s)", (reverse) => {
    const { store } = database();
    const earlier = completed(1), farther = travel(completed(3), "station");
    for (const p of reverse ? [farther, earlier] : [earlier, farther]) store.migrate(JSON.stringify(p));
    const result = store.read();
    expect(result.progress.lessonIndex).toBe(3);
    expect(fuel(result.progress.space)).toBe(220);
    expect(result.progress.space.current).toBe("station");
    expect(result.progress.space.transactions.filter((t) => t.id === "travel:station:first")).toHaveLength(1);
    expect(readBackup(JSON.stringify(result.progress))).toEqual(result.progress);
  });
  it("remembers migration on disk and does not reapply old drafts or fuel after new learning", () => {
    const { store, file } = database();
    const legacy = JSON.stringify(travel(completed(3), "station"));
    const first = store.migrate(legacy);
    const newer = store.save({ ...first.progress, step: 1, page: "lesson", completed: [0] }, first.revision);
    const restarted = new ProgressStore(file); stores.push(restarted);
    expect(restarted.migrate(legacy)).toEqual(newer);
  });
  it("keeps valid legacy v1/v2/v3 completion without awarding later lessons", () => {
    for (const version of [1, 2, 3]) {
      const { store } = database();
      const legacy = JSON.stringify({ ...parseProgress(null), version, completed: version === 1 ? [0, 1, 2, 3] : [0, 1, 2], step: version === 1 ? 3 : 2 });
      const migrated = store.migrate(legacy);
      expect(migrated.progress.lessonIndex).toBe(0);
      expect(fuel(migrated.progress.space)).toBe(30);
    }
  });
  it("rejects invalid balances and leaves the previous database revision intact", () => {
    const { store } = database();
    const saved = store.save(completed(1), 0);
    const corrupt: Progress = { ...saved.progress, space: { ...saved.progress.space,
      transactions: [...saved.progress.space.transactions, { id: "fake", amount: 999 }] } };
    expect(() => store.save(corrupt, saved.revision)).toThrow(/燃料/);
    expect(() => store.migrate(JSON.stringify(corrupt))).toThrow(/燃料/);
    expect(store.read()).toEqual(saved);
  });
  it("preserves collected items, station confirmations and both practice histories", () => {
    let a = travel(completed(1), "station");
    for (let n = 0; n < 3; n++) a = confirmStation(a, n);
    a = startPractice(a);
    a = observePractice(a, a.practice!.session!.itemIds[0], "together");
    let b = startPractice(completed(3));
    b = observePractice(b, b.practice!.session!.itemIds[0], "prompted");
    a.records[lessons[0].id] = { ...a.records[lessons[0].id], dialogue: { ...newDialogue(), rewards: ["apple"] } };
    b.records[lessons[0].id] = { ...b.records[lessons[0].id], dialogue: { ...newDialogue(), rewards: ["gem"] } };
    const merged = mergeLegacyProgress(a, b);
    expect(merged.space.badge).toBe(true);
    expect(fuel(merged.space)).toBe(220);
    expect(merged.practice!.observations).toHaveLength(2);
    expect(merged.records[lessons[0].id].dialogue!.rewards).toEqual(["apple", "gem"]);
    expect(readBackup(JSON.stringify(merged))).toEqual(merged);
  });
  it("refuses to silently replace a corrupt database with an empty one", () => {
    const dir = mkdtempSync(join(tmpdir(), "tom-phonics-corrupt-")); directories.push(dir);
    const file = join(dir, "progress.sqlite"); writeFileSync(file, "broken database");
    expect(() => new ProgressStore(file)).toThrow();
  });
});
