import { shopNodes, type NodeId, type ShopItem } from "../data/dialogues/shop";
export type DialogueState = {
  node: NodeId;
  hint: "full" | "keyword" | "none";
  confirmed: boolean;
  item?: ShopItem;
  completed: NodeId[];
  assisted: NodeId[];
  rewards: ShopItem[];
};
export const newDialogue = (): DialogueState => ({
  node: "greeting",
  hint: "full",
  confirmed: false,
  completed: [],
  assisted: [],
  rewards: [],
});
export type DialogueAction =
  | { type: "confirm"; assisted?: boolean }
  | { type: "choose"; item: ShopItem }
  | { type: "hint"; hint: DialogueState["hint"] }
  | { type: "replay" };
export function dialogueReducer(
  s: DialogueState,
  a: DialogueAction,
): DialogueState {
  if (a.type === "hint") return { ...s, hint: a.hint };
  if (a.type === "replay")
    return { ...newDialogue(), hint: s.hint, rewards: s.rewards };
  if (s.node === "completed") return s;
  if (a.type === "choose") {
    if (
      s.node !== "request" ||
      !s.confirmed ||
      !["apple", "gem"].includes(a.item)
    )
      return s;
    return {
      ...s,
      item: a.item,
      node: "thanks",
      confirmed: false,
      completed: [...s.completed, "request"],
    };
  }
  if (s.node === "request" && s.confirmed) return s;
  const assisted = a.assisted
    ? [...new Set([...s.assisted, s.node])]
    : s.assisted;
  if (s.node === "request") return { ...s, confirmed: true, assisted };
  if ((s.node === "thanks" || s.node === "goodbye") && !s.item) return s;
  const node = shopNodes[s.node].next;
  return {
    ...s,
    node,
    confirmed: false,
    assisted,
    completed: [...s.completed, s.node],
    rewards:
      node === "completed" && s.item
        ? [...new Set([...s.rewards, s.item])]
        : s.rewards,
  };
}
export function parseDialogue(value: unknown): DialogueState {
  const base = newDialogue();
  if (!value || typeof value !== "object") return base;
  const v = value as Record<string, unknown>;
  const order: NodeId[] = ["greeting", "request", "thanks", "goodbye"];
  const completed: NodeId[] = [];
  if (Array.isArray(v.completed))
    for (const id of order) {
      if (!v.completed.includes(id)) break;
      completed.push(id);
    }
  const item = v.item === "apple" || v.item === "gem" ? v.item : undefined;
  if (!item && completed.length > 1) completed.splice(1);
  const node = order[completed.length] ?? "completed";
  return {
    ...base,
    node,
    item,
    completed,
    hint: v.hint === "none" || v.hint === "keyword" ? v.hint : "full",
    confirmed: node === "request" && v.confirmed === true,
    assisted: Array.isArray(v.assisted)
      ? order.filter(
          (id) =>
            (completed.includes(id) ||
              (node === "request" &&
                v.confirmed === true &&
                id === "request")) &&
            (v.assisted as unknown[]).includes(id),
        )
      : [],
    rewards: Array.isArray(v.rewards)
      ? (["apple", "gem"] as const).filter((i) =>
          (v.rewards as unknown[]).includes(i),
        )
      : [],
  };
}
