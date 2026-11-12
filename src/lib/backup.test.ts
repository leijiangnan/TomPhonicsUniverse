import { describe, expect, it } from "vitest";
import { backupSummary, createBackup, MAX_BACKUP_BYTES, readBackup } from "./backup";
import { hintPractice, observePractice, startPractice } from "./practice";
import { initialProgress, parseProgress, selectCourse, openPlanet, visitPhonicsCard } from "./progress";
import { fuel, reconcileRewards, travel } from "./space";
import { lessons } from "../data/lesson";
import { reviewForLesson } from "../data/reviews";

const learned = () => reconcileRewards({ ...initialProgress, completed: [0, 1, 2], blendCompleted: [0, 1], speakingCompleted: true, volume: .4 });
describe("reviewable local backups", () => {
  it("round-trips partial phonics card visits and accepts old saves without visits", () => {
    let p = visitPhonicsCard(openPlanet(initialProgress, "forest"), "sock");
    p = visitPhonicsCard(p, "sound");
    expect(readBackup(createBackup(p)).phonicsCards).toEqual({ s: ["sound", "sock"] });
    const older = { ...learned() };
    delete older.phonicsCards;
    const restored = readBackup(createBackup(older));
    expect(restored.completed).toEqual([0, 1, 2]);
    expect(restored.phonicsCards).toEqual({});
    const archive = { ...selectCourse(learned(), 1), records: {
      [lessons[0].id]: { ...selectCourse(learned(), 1).records[lessons[0].id], phonicsCards: { s: ["sound", "sun"] } },
    } };
    expect(readBackup(createBackup(archive)).records[lessons[0].id].phonicsCards).toEqual({ s: ["sound", "sun"] });
  });
  it("rejects malformed, duplicate, foreign and locked-step card visits before importing", () => {
    for (const phonicsCards of [null, false, [], { s: "sound" }, { s: ["sun", "sun"] },
      { s: ["apple"] }, { a: ["sound"] }, { unknown: ["sound"] }, { s: [1] }])
      expect(() => readBackup(JSON.stringify({ ...initialProgress, phonicsCards }))).toThrow("卡片点读记录无效");
  });
  it("round-trips explicit motion choices and accepts existing backups without settings", () => {
    expect(readBackup(createBackup(learned()))).not.toHaveProperty("preferences");
    for (const ambientMotion of [true, false]) {
      const p = { ...learned(), preferences: { ambientMotion } };
      const restored = readBackup(createBackup(p));
      expect(restored.preferences).toEqual({ ambientMotion });
      expect(restored.space).toEqual(p.space);
      expect(backupSummary(restored)).toEqual(backupSummary(p));
    }
  });
  it("rejects malformed motion choices before importing a backup", () => {
    for (const preferences of [null, false, [], {}, { ambientMotion: "false" }, { ambientMotion: 0 }])
      expect(() => readBackup(JSON.stringify({ ...initialProgress, preferences }))).toThrow("背景动效设置无效");
  });
  it("round-trips learning, voyage, draft, volume, observations and a current session", () => {
    let p = startPractice({ ...travel(learned(), "station"), blendDraft: ["a"] });
    const id = p.practice!.session!.itemIds[0];
    p = observePractice(hintPractice(p, id), id, "prompted");
    const restored = readBackup(createBackup(p));
    expect(restored).toEqual(parseProgress(JSON.stringify(p)));
    expect(backupSummary(restored)).toEqual({ completedCourses: 1, lesson: 1, fuel: 40, observations: 1 });
  });
  it("migrates valid v1, v2 and v3 raw saves", () => {
    expect(fuel(readBackup(JSON.stringify({ version: 1, step: 3, completed: [0, 1, 2, 3], volume: .4, page: "lesson" })).space)).toBe(30);
    expect(fuel(readBackup(JSON.stringify({ ...learned(), version: 2 })).space)).toBe(90);
    const p = selectCourse(learned(), 1);
    expect(readBackup(JSON.stringify({ ...p, version: 3 })).lessonIndex).toBe(1);
  });
  it("rejects corrupt, unknown, oversized and incomplete files instead of replacing with defaults", () => {
    for (const raw of ["broken", "null", "[]", '{"version":99}', '{"version":4}', JSON.stringify({ ...initialProgress, records: { unknown: {} } }), JSON.stringify({ ...initialProgress, completed: [-1] }), JSON.stringify({ ...initialProgress, page: "blending" }), " ".repeat(MAX_BACKUP_BYTES + 1)]) expect(() => readBackup(raw)).toThrow();
  });
  it("rejects forged or duplicate fuel events and impossible destinations", () => {
    const p = travel(learned(), "station");
    const transaction = p.space.transactions[0];
    for (const space of [
      { ...p.space, transactions: [...p.space.transactions, transaction] },
      { ...p.space, transactions: [{ ...transaction, amount: 9000 }] },
      { ...initialProgress.space, current: "station" },
      { ...initialProgress.space, badge: true, stationStep: 3 },
    ]) expect(() => readBackup(JSON.stringify({ ...p, space }))).toThrow();
  });
  it("can reconcile missing legitimate rewards without duplicating them", () => {
    const p = readBackup(JSON.stringify({ ...learned(), space: initialProgress.space }));
    expect(fuel(p.space)).toBe(90);
    expect(readBackup(createBackup(p)).space).toEqual(p.space);
  });
  it("rejects completion claims without prerequisites and invalid review observations", () => {
    expect(() => readBackup(JSON.stringify({ ...initialProgress, speakingCompleted: true }))).toThrow();
    expect(() => readBackup(JSON.stringify({ ...initialProgress, practice: { turn: 1, observations: [{ itemId: "word:quit", outcome: "independent", turn: 1 }] } }))).toThrow();
  });
  it("round-trips all sixteen courses, including scene reviews and archived drafts", () => {
    let p = initialProgress;
    for (const [n, lesson] of lessons.entries()) {
      if (n) p = selectCourse(p, n);
      const review = reviewForLesson(lesson.id);
      const completed = lesson.steps.map((_, i) => i), rounds = lesson.blendRounds.map((_, i) => i);
      p = reconcileRewards({ ...p, completed, step: completed.length - 1, blendCompleted: rounds,
        blendRound: review ? review.placementBatches.length - 1 : rounds.length - 1,
        blendDraft: review ? [] : lesson.blendRounds.at(-1)!.word.match(/qu|./g)!, blendSolved: !review,
        reviewSounds: review ? completed : [], reviewPlacements: review ? rounds : [],
        reviewDialogueStep: review?.dialogue.length ?? 0, speakingCompleted: true });
    }
    expect(backupSummary(readBackup(createBackup(p))).completedCourses).toBe(16);
    expect(readBackup(createBackup(p))).toEqual(parseProgress(JSON.stringify(p)));
    expect(() => readBackup(createBackup({ ...p, blendDraft: ["not-a-taught-tile"] }))).toThrow();
  });
});
