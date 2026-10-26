import { describe, it, expect } from "vitest";
import {
  initialProgress,
  parseProgress,
  selectCourse,
  type Progress,
} from "./progress";
import { lessons } from "../data/lesson";
import {
  reconcileRewards,
  travel,
  fuel,
  stationFound,
  confirmStation,
  restoreSpace,
} from "./space";
const done = (p: Progress): Progress =>
  reconcileRewards({
    ...p,
    completed: lessons[p.lessonIndex].steps.map((_, n) => n),
    blendCompleted: lessons[p.lessonIndex].blendRounds.map((_, n) => n),
    speakingCompleted: true,
  });
describe("learning fuel and first voyage", () => {
  it("awards each stage once and gives 90 for one full lesson", () => {
    expect(fuel(initialProgress.space)).toBe(0);
    const forest = reconcileRewards({
      ...initialProgress,
      completed: [0, 1, 2],
    });
    expect(fuel(forest.space)).toBe(30);
    const dunes = reconcileRewards({ ...forest, blendCompleted: [0, 1] });
    expect(fuel(dunes.space)).toBe(50);
    const lesson = done(dunes);
    expect(fuel(lesson.space)).toBe(90);
    expect(reconcileRewards(lesson)).toBe(lesson);
  });
  it.each([1, 2, 3])(
    "migrates v%s completion and grants only legitimate missing rewards",
    (version) => {
      const state = parseProgress(
        JSON.stringify({ ...done(initialProgress), version }),
      );
      expect(fuel(state.space)).toBe(version === 1 ? 30 : 90);
      expect(parseProgress(JSON.stringify(state))).toEqual(state);
    },
  );
  it("grants 270 for three complete courses, including archived progress", () => {
    let p = done(initialProgress);
    p = done(selectCourse(p, 1));
    p = done(selectCourse(p, 2));
    expect(fuel(p.space)).toBe(270);
    expect(
      fuel(parseProgress(JSON.stringify({ ...p, version: 3 })).space),
    ).toBe(270);
  });
  it("grants 720 for all eight alphabet-launch courses", () => {
    let p = initialProgress;
    for (const n of lessons.keys()) {
      p = done(p);
      if (n + 1 < lessons.length) p = selectCourse(p, n + 1);
    }
    expect(fuel(p.space)).toBe(720);
    expect(fuel(parseProgress(JSON.stringify(p)).space)).toBe(720);
  });
  it("blocks insufficient fuel, charges first arrival once and allows free return", () => {
    expect(travel(initialProgress, "station")).toBe(initialProgress);
    const first = travel(done(initialProgress), "station");
    expect(fuel(first.space)).toBe(40);
    expect(stationFound(first.space)).toBe(true);
    expect(travel(first, "station")).toBe(first);
    const second = travel(travel(first, "earth"), "station");
    expect(fuel(second.space)).toBe(40);
    expect(parseProgress(JSON.stringify(second)).space).toEqual(second.space);
  });
  it("persists station steps, rejects stale confirmations and collects once", () => {
    let p = travel(done(initialProgress), "station");
    expect(confirmStation(p, 1)).toBe(p);
    p = confirmStation(p, 0);
    expect(confirmStation(p, 0)).toBe(p);
    p = parseProgress(JSON.stringify(p));
    expect(p.space.stationStep).toBe(1);
    p = confirmStation(p, 1);
    p = confirmStation(p, 2);
    expect(p.space.badge).toBe(true);
    expect(confirmStation(p, 2)).toBe(p);
    expect(fuel(p.space)).toBe(40);
    expect(parseProgress(JSON.stringify(p)).space.badge).toBe(true);
  });
  it("repairs invalid, duplicate and unsupported events without granting discoveries", () => {
    const space = restoreSpace(
      {
        current: "station",
        stationStep: 3,
        badge: true,
        transactions: [
          { id: "travel:station:first", amount: -50 },
          { id: "fake", amount: 999 },
        ],
      },
      initialProgress,
    );
    expect(fuel(space)).toBe(0);
    expect(stationFound(space)).toBe(false);
    expect(space.badge).toBe(false);
    const complete = done(initialProgress);
    const arrived = travel(complete, "station");
    const repeated = restoreSpace(
      {
        ...arrived.space,
        transactions: [
          ...arrived.space.transactions,
          ...arrived.space.transactions,
        ],
      },
      complete,
    );
    expect(fuel(repeated)).toBe(40);
  });
  it("does not mix exploration state with lesson archives", () => {
    const p = travel(done(initialProgress), "station");
    const next = selectCourse(p, 1);
    expect(next.space).toBe(p.space);
    expect(parseProgress(JSON.stringify(next)).space).toEqual(p.space);
  });
  it("has audio resources for all station lines", () => {
    const files = import.meta.glob("../../public/audio/station/*.mp3");
    expect(Object.keys(files)).toHaveLength(3);
  });
});
