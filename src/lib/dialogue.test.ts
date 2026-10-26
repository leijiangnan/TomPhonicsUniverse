import { describe, it, expect } from "vitest";
import {
  dialogueReducer as reduce,
  newDialogue,
  parseDialogue,
} from "./dialogue";
import {
  initialProgress,
  parseProgress,
  selectCourse,
  courseUnlocked,
} from "./progress";
import { shopNodes, shopItems, clip } from "../data/dialogues/shop";
const ready = {
  ...initialProgress,
  completed: [0, 1, 2],
  blendCompleted: [0, 1],
};
function finish(item: "apple" | "gem") {
  let s = reduce(newDialogue(), { type: "confirm" });
  s = reduce(s, { type: "confirm", assisted: true });
  s = reduce(s, { type: "choose", item });
  s = reduce(s, { type: "confirm" });
  return reduce(s, { type: "confirm" });
}
describe("first lesson dialogue", () => {
  it("gates choices behind parent confirmation and preserves the chosen branch", () => {
    let s = newDialogue();
    expect(reduce(s, { type: "choose", item: "gem" })).toBe(s);
    s = reduce(s, { type: "confirm" });
    expect(s.node).toBe("request");
    expect(reduce(s, { type: "choose", item: "gem" })).toBe(s);
    s = reduce(s, { type: "confirm" });
    s = reduce(s, { type: "choose", item: "gem" });
    expect(s.node).toBe("thanks");
    expect(s.item).toBe("gem");
    expect(s.rewards).toEqual([]);
  });
  it.each(["apple", "gem"] as const)(
    "finishes %s, gives one item, and makes repeated confirmation idempotent",
    (item) => {
      const s = finish(item);
      expect(s.node).toBe("completed");
      expect(s.rewards).toEqual([item]);
      expect(s.assisted).toEqual(["request"]);
      expect(reduce(s, { type: "confirm" })).toBe(s);
      let replay = reduce(s, { type: "replay" });
      for (let n = 0; n < 2; n++) replay = reduce(replay, { type: "confirm" });
      replay = reduce(replay, { type: "choose", item });
      for (let n = 0; n < 2; n++) replay = reduce(replay, { type: "confirm" });
      expect(replay.rewards).toEqual([item]);
    },
  );
  it("resumes choice confirmation, hint and partial dialogue without unlocking a course", () => {
    let s = reduce(newDialogue(), { type: "confirm" });
    s = reduce(s, { type: "confirm", assisted: true });
    s = reduce(s, { type: "hint", hint: "keyword" });
    const restored = parseProgress(
      JSON.stringify({ ...ready, page: "speaking", dialogue: s }),
    );
    expect(restored.dialogue).toEqual({ ...s, item: undefined });
    expect(courseUnlocked(restored, 1)).toBe(false);
    expect(
      reduce(restored.dialogue!, { type: "choose", item: "apple" }).node,
    ).toBe("thanks");
  });
  it("keeps old completion, archives dialogue by course, and does not leak it into lesson two", () => {
    const old = parseProgress(
      JSON.stringify({ ...ready, speakingCompleted: true }),
    );
    expect(courseUnlocked(old, 1)).toBe(true);
    expect(old.dialogue).toBeUndefined();
    const state = { ...old, dialogue: finish("gem") };
    const second = selectCourse(state, 1);
    expect(second.dialogue).toBeUndefined();
    const restored = parseProgress(JSON.stringify(second));
    expect(restored.dialogue).toBeUndefined();
    expect(selectCourse(restored, 0).dialogue).toEqual(state.dialogue);
  });
  it("repairs invalid nodes and missing choices, and ignores dialogue before dunes", () => {
    expect(parseDialogue({ node: "completed", completed: [] }).node).toBe(
      "greeting",
    );
    expect(
      parseDialogue({ completed: ["greeting", "request", "thanks", "goodbye"] })
        .node,
    ).toBe("request");
    expect(
      parseProgress(
        JSON.stringify({ ...initialProgress, dialogue: finish("apple") }),
      ).dialogue,
    ).toBeUndefined();
  });
  it("has a local audio clip for every NPC branch and model sentence", () => {
    const files = import.meta.glob("../../public/audio/shop/*.mp3");
    const paths = [
      ...Object.values(shopNodes).flatMap((n) => [n.audio, n.model]),
      ...Object.values(shopItems).map((i) => i.audio),
      clip("give-apple"),
      clip("give-gem"),
    ].filter(Boolean);
    for (const path of paths)
      expect(`../../public${path}` in files, path).toBe(true);
  });
});
