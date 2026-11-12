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
  nodeVisited,
  visitedNodes,
  nextDestination,
  travelStatus,
} from "./space";
import { travelNodes, type SpaceNodeId } from "../data/space/route";
import { readBackup, createBackup } from "./backup";
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
    for (const n of lessons.slice(0, 8).keys()) {
      p = done(p);
      if (n + 1 < 8) p = selectCourse(p, n + 1);
    }
    expect(fuel(p.space)).toBe(720);
    expect(fuel(parseProgress(JSON.stringify(p)).space)).toBe(720);
    const ninth = done(selectCourse(p, 8));
    expect(fuel(ninth.space)).toBe(810);
    expect(reconcileRewards(ninth)).toBe(ninth);
  });
  it("awards each of the sixteen implemented lessons once", () => {
    let p = initialProgress;
    for (let n = 0; n < lessons.length; n++) {
      p = done(p);
      if (n + 1 < lessons.length) p = selectCourse(p, n + 1);
    }
    expect(fuel(p.space)).toBe(1440);
    expect(fuel(parseProgress(JSON.stringify(p)).space)).toBe(1440);
    expect(reconcileRewards(p)).toBe(p);
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

describe("complete Earth-Moon navigation", () => {
  function learned(count: number) {
    let p = initialProgress;
    for (let n = 0; n < count; n++) {
      p = done(p);
      if (n + 1 < lessons.length) p = selectCourse(p, n + 1);
    }
    return p;
  }
  it("lets the existing 70-fuel station visitor continue to the ISS for 50", () => {
    let p = reconcileRewards({ ...learned(1), completed: [0, 1, 2] });
    p = travel(p, "station");
    expect(fuel(p.space)).toBe(70);
    expect(nextDestination(p.space)?.name).toBe("国际空间站");
    expect(travelStatus(p.space, "catalog-2").kind).toBe("ready");
    p = travel(p, "catalog-2");
    expect(fuel(p.space)).toBe(20);
    expect(p.space.current).toBe("catalog-2");
    expect(p.space.stationStep).toBe(0);
    expect(travelStatus(p.space, "moon").shortfall).toBe(80);
    expect(travel(p, "moon")).toBe(p);
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
  it("flies the full ordered route, restores each stop and charges each first arrival once", () => {
    let p = learned(8);
    const starting = fuel(p.space);
    for (const node of travelNodes.slice(1)) {
      p = travel(p, node.id);
      expect(p.space.current).toBe(node.id);
      expect(nodeVisited(p.space, node.id)).toBe(true);
      expect(travel(p, node.id)).toBe(p);
      p = readBackup(createBackup(p));
    }
    expect(visitedNodes(p.space)).toHaveLength(9);
    expect(nextDestination(p.space)).toBeUndefined();
    expect(fuel(p.space)).toBe(starting - 500);
    const transactions = p.space.transactions;
    for (const node of [...travelNodes].reverse()) p = travel(p, node.id);
    expect(p.space.transactions).toBe(transactions);
    expect(fuel(p.space)).toBe(starting - 500);
  });
  it("requires previous discoveries, rejects other regions and preserves free revisits at zero fuel", () => {
    let p = reconcileRewards({ ...learned(5), completed: lessons[5].steps.map((_, i) => i), blendCompleted: lessons[5].blendRounds.map((_, i) => i) });
    expect(fuel(p.space)).toBe(500);
    expect(travelStatus(p.space, "moon").kind).toBe("locked");
    expect(travel(p, "moon")).toBe(p);
    expect(travel(p, "mars" as SpaceNodeId)).toBe(p);
    for (const node of travelNodes.slice(1)) p = travel(p, node.id);
    expect(fuel(p.space)).toBe(0);
    p = travel(p, "earth");
    p = travel(p, "catalog-8");
    expect(p.space.current).toBe("catalog-8");
    expect(fuel(p.space)).toBe(0);
  });
  it("repairs skipped discoveries, wrong fees and unearned positions without changing old deductions", () => {
    const p = learned(8);
    const skipped = { ...p, space: { ...p.space, current: "moon", transactions: [...p.space.transactions, { id: "travel:moon:first", amount: -100 }] } };
    expect(parseProgress(JSON.stringify(skipped)).space.current).toBe("earth");
    expect(() => readBackup(JSON.stringify(skipped))).toThrow(/燃料|探索/);
    const first = travel(p, "station");
    const wrongFee = { ...first, space: { ...first.space, current: "catalog-2", transactions: [...first.space.transactions, { id: "travel:catalog-2:first", amount: -49 }] } };
    const restored = parseProgress(JSON.stringify(wrongFee));
    expect(fuel(restored.space)).toBe(670);
    expect(nodeVisited(restored.space, "station")).toBe(true);
    expect(nodeVisited(restored.space, "catalog-2")).toBe(false);
    expect(() => readBackup(JSON.stringify(wrongFee))).toThrow(/燃料|探索/);
  });
  it("preserves the legacy station badge and fixed 50-fuel event as navigation expands", () => {
    let p = travel(learned(8), "station");
    for (let n = 0; n < 3; n++) p = confirmStation(p, n);
    const oldSpace = readBackup(createBackup(p)).space;
    expect(oldSpace).toEqual(p.space);
    p = travel(p, "catalog-2");
    expect(p.space.badge).toBe(true);
    expect(p.space.transactions.filter((event) => event.id === "travel:station:first")).toEqual([{ id: "travel:station:first", amount: -50 }]);
  });
});
