import { lessons } from "../data/lesson";
import type { Progress } from "./progress";
export type SpaceNodeId = "earth" | "station";
export type Transaction = { id: string; amount: number };
export type SpaceProgress = {
  current: SpaceNodeId;
  transactions: Transaction[];
  stationStep: 0 | 1 | 2 | 3;
  badge: boolean;
};
export const initialSpace = (): SpaceProgress => ({
  current: "earth",
  transactions: [],
  stationStep: 0,
  badge: false,
});
export const STATION_COST = 50;
export const fuel = (space: SpaceProgress) =>
  space.transactions.reduce((total, t) => total + t.amount, 0);
export const stationFound = (space: SpaceProgress) =>
  space.transactions.some((t) => t.id === "travel:station:first");
export function earnedRewards(p: Progress): Transaction[] {
  const result: Transaction[] = [];
  for (const [i, lesson] of lessons.entries()) {
    const record = i === p.lessonIndex ? p : p.records[lesson.id];
    if (!record) break;
    const forest = lesson.steps.every((_, n) => record.completed.includes(n));
    const dunes =
      forest &&
      lesson.blendRounds.every((_, n) => record.blendCompleted.includes(n));
    const crystal = dunes && record.speakingCompleted;
    for (const [stage, done, amount] of [
      ["forest", forest, 30],
      ["dunes", dunes, 20],
      ["crystal", crystal, 30],
      ["complete", crystal, 10],
    ] as const)
      if (done) result.push({ id: `lesson:${lesson.id}:${stage}`, amount });
    if (!crystal) break;
  }
  return result;
}
// Only known events justified by restored learning progress are accepted.
export function restoreSpace(raw: unknown, p: Progress): SpaceProgress {
  const base = initialSpace();
  const v =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rewards = earnedRewards(p);
  const hasTravel =
    Array.isArray(v.transactions) &&
    v.transactions.some(
      (t) =>
        t &&
        typeof t === "object" &&
        t.id === "travel:station:first" &&
        t.amount === -STATION_COST,
    );
  base.transactions = rewards;
  if (hasTravel && fuel(base) >= STATION_COST)
    base.transactions.push({
      id: "travel:station:first",
      amount: -STATION_COST,
    });
  if (stationFound(base)) {
    base.current = v.current === "station" ? "station" : "earth";
    base.stationStep =
      typeof v.stationStep === "number" &&
      Number.isInteger(v.stationStep) &&
      v.stationStep >= 0 &&
      v.stationStep <= 3
        ? (v.stationStep as 0 | 1 | 2 | 3)
        : 0;
    base.badge = base.stationStep === 3;
  }
  return base;
}
export function reconcileRewards(p: Progress): Progress {
  const existing = new Set(p.space.transactions.map((t) => t.id));
  const missing = earnedRewards(p).filter((t) => !existing.has(t.id));
  return missing.length
    ? {
        ...p,
        space: {
          ...p.space,
          transactions: [...p.space.transactions, ...missing],
        },
      }
    : p;
}
export function travel(p: Progress, target: SpaceNodeId): Progress {
  const state = reconcileRewards(p);
  if (target !== "earth" && target !== "station") return p;
  if (target === state.space.current) return state;
  const space = state.space;
  if (target === "station" && !stationFound(space)) {
    if (fuel(space) < STATION_COST) return state;
    return {
      ...state,
      space: {
        ...space,
        current: target,
        transactions: [
          ...space.transactions,
          { id: "travel:station:first", amount: -STATION_COST },
        ],
      },
    };
  }
  return { ...state, space: { ...space, current: target } };
}
export function confirmStation(p: Progress, expected: number): Progress {
  const s = p.space;
  if (
    s.current !== "station" ||
    !stationFound(s) ||
    s.stationStep !== expected ||
    expected >= 3
  )
    return p;
  const step = (expected + 1) as 1 | 2 | 3;
  return { ...p, space: { ...s, stationStep: step, badge: step === 3 } };
}
