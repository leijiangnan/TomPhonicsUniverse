import { lessons } from "../data/lesson";
import type { Progress } from "./progress";
import { FIRST_TRAVEL_COSTS, isSpaceNode, routeNode, travelEventId, travelNodes, type SpaceNodeId } from "../data/space/route";
import { nextExplorationNode } from "../data/space/catalog";
export type { SpaceNodeId } from "../data/space/route";
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
export const STATION_COST = FIRST_TRAVEL_COSTS.station;
export const fuel = (space: SpaceProgress) =>
  space.transactions.reduce((total, t) => total + t.amount, 0);
export const stationFound = (space: SpaceProgress) =>
  space.transactions.some((t) => t.id === "travel:station:first");
export const nodeVisited = (space: SpaceProgress, id: string) => isSpaceNode(id) &&
  (id === "earth" || space.transactions.some((t) => t.id === travelEventId(id)));
export const visitedNodes = (space: SpaceProgress) => travelNodes.filter((node) => nodeVisited(space, node.id));
export function nextDestination(space: SpaceProgress) {
  const next = nextExplorationNode(new Set(visitedNodes(space).map((node) => node.id)));
  return next && isSpaceNode(next.id) ? routeNode(next.id) : undefined;
}
export function travelStatus(space: SpaceProgress, target: string) {
  if (!isSpaceNode(target)) return { kind: "unavailable" as const, cost: 0, shortfall: 0, previous: undefined };
  const node = routeNode(target);
  const cost = nodeVisited(space, target) ? 0 : node.cost;
  const shortfall = Math.max(0, cost - fuel(space));
  const kind = target === space.current ? "current" : nodeVisited(space, target) ? "free"
    : node.previous && !nodeVisited(space, node.previous) ? "locked" : shortfall > 0 ? "fuel" : "ready";
  return { kind, cost, shortfall, previous: node.previous };
}
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
  base.transactions = rewards;
  for (const node of travelNodes.slice(1)) {
    const valid = Array.isArray(v.transactions) && v.transactions.some((t) =>
      t && typeof t === "object" && t.id === travelEventId(node.id) && t.amount === -node.cost);
    if (!valid || fuel(base) < node.cost) break;
    base.transactions.push({ id: travelEventId(node.id), amount: -node.cost });
  }
  if (isSpaceNode(v.current) && nodeVisited(base, v.current)) base.current = v.current;
  if (stationFound(base)) {
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
  const status = travelStatus(state.space, target);
  if (status.kind !== "ready" && status.kind !== "free") return state;
  const space = state.space;
  return { ...state, space: { ...space, current: target,
    transactions: status.kind === "free" ? space.transactions : [...space.transactions, { id: travelEventId(target), amount: -status.cost }] } };
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
