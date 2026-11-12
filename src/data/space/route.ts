import { explorationRegions, type CatalogNode } from "./catalog";

// Fixed first-discovery prices. Never change a historical event's amount.
export const FIRST_TRAVEL_COSTS = {
  earth: 0, station: 50, "catalog-2": 50, moon: 100, "catalog-4": 40,
  "catalog-5": 40, "catalog-6": 60, "catalog-7": 60, "catalog-8": 100,
} as const;
export type SpaceNodeId = keyof typeof FIRST_TRAVEL_COSTS;
export const isSpaceNode = (id: unknown): id is SpaceNodeId => typeof id === "string" && Object.hasOwn(FIRST_TRAVEL_COSTS, id);
export type TravelNode = CatalogNode & { id: SpaceNodeId; cost: number; previous?: SpaceNodeId };
export const travelNodes: TravelNode[] = explorationRegions[0].nodes
  .filter((node): node is CatalogNode & { id: SpaceNodeId } => isSpaceNode(node.id))
  .map((node, index, nodes) => ({ ...node, cost: FIRST_TRAVEL_COSTS[node.id], previous: nodes[index - 1]?.id }));
export const routeNode = (id: SpaceNodeId): TravelNode => travelNodes.find((node) => node.id === id)!;
export const travelEventId = (id: SpaceNodeId) => `travel:${id}:first`;
