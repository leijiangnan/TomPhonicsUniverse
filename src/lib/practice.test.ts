import { describe, expect, it } from "vitest";
import { lessons } from "../data/lesson";
import { readingPhrases, wordSegments } from "../data/learning";
import { initialProgress, parseProgress, selectCourse, type Progress } from "./progress";
import { fuel, reconcileRewards } from "./space";
import { hintPractice, observePractice, practiceItems, practicePool, startPractice } from "./practice";

function completeThrough(last: number) {
  let p: Progress = initialProgress;
  for (let n = 0; n <= last; n++) {
    if (n) p = selectCourse(p, n);
    p = reconcileRewards({ ...p, completed: lessons[n].steps.map((_, i) => i), blendCompleted: lessons[n].blendRounds.map((_, i) => i), speakingCompleted: true });
  }
  return p;
}
describe("short practice and teaching dependencies", () => {
  it("offers only taught correspondences and excludes oral-only picture words", () => {
    expect(practicePool(initialProgress)).toEqual([]);
    expect(practicePool({ ...initialProgress, completed: [0] }).map((item) => item.id)).toEqual(["sound:s"]);
    const items = practicePool({ ...initialProgress, completed: [0, 1, 2] });
    expect(items.map((item) => item.id).sort()).toEqual(["sound:a", "sound:s", "sound:t", "word:at", "word:sat"]);
    expect(items.every((item) => item.requires.every((rule) => ["s", "a", "t"].includes(rule)))).toBe(true);
  });
  it("preserves the first introduction of repeated words and sounds", () => {
    const ids = practicePool(completeThrough(0)).map((item) => item.id);
    expect(ids).toContain("sound:a"); expect(ids).toContain("word:sat");
    expect(ids).not.toContain("word:map");
  });
  it("introduces short phrases only in their configured taught lessons", () => {
    expect(practicePool(completeThrough(4)).some((item) => item.kind === "phrase")).toBe(false);
    expect(practicePool(completeThrough(5)).filter((item) => item.kind === "phrase").map((item) => item.text)).toEqual(["red hen"]);
    expect(practicePool(completeThrough(6)).filter((item) => item.kind === "phrase").map((item) => item.text)).toEqual(["red hen", "big bug"]);
    for (const phrase of readingPhrases) {
      const taught = new Set(lessons.slice(0, phrase.lessonIndex + 1).flatMap((lesson) => lesson.steps.map((step) => step.id)));
      expect(phrase.requires.every((rule) => taught.has(rule))).toBe(true);
      expect(phrase.words.join(" ")).toBe(phrase.text);
    }
  });
  it("allows curated new word combinations only after their exact rules are taught", () => {
    expect(practicePool(completeThrough(0)).some((item) => item.transfer)).toBe(false);
    expect(practicePool(completeThrough(1)).filter((item) => item.transfer).map((item) => item.text)).toEqual(["pan"]);
    expect(practicePool(completeThrough(2)).filter((item) => item.transfer).map((item) => item.text)).toEqual(["pan", "mat"]);
    expect(practiceItems.filter((item) => item.kind !== "sound").every((item) => item.usageType === "decodable")).toBe(true);
    for (const item of practiceItems.filter((item) => item.kind !== "sound")) {
      const segments = item.text.split(" ").flatMap(wordSegments);
      expect(segments.every((segment) => item.requires.includes(segment.grapheme))).toBe(true);
      expect(new Set(segments.map((segment) => segment.grapheme))).toEqual(new Set(item.requires));
    }
  });
  it("distinguishes tiles from phonemes for x and qu", () => {
    expect(wordSegments("quit").map((item) => item.grapheme)).toEqual(["qu", "i", "t"]);
    expect(wordSegments("quit").flatMap((item) => item.phonemes)).toEqual(["k", "w", "ɪ", "t"]);
    expect(wordSegments("box").flatMap((item) => item.phonemes)).toEqual(["b", "ɑ", "k", "s"]);
    for (const lesson of lessons) for (const round of lesson.blendRounds) {
      expect(wordSegments(round.word).every((item) => item.phonemes.length && item.audio)).toBe(true);
    }
  });
  it("resumes a short session and records an observation only once per item", () => {
    const p = completeThrough(0), practice = startPractice(p);
    expect(practice.practice?.session?.itemIds).toHaveLength(3);
    expect(startPractice(practice).practice?.session).toBe(practice.practice?.session);
    const id = practice.practice!.session!.itemIds[0];
    const next = observePractice(practice, id, "independent");
    expect(next.practice?.session?.index).toBe(1);
    expect(observePractice(next, id, "independent")).toBe(next);
    expect(next.completed).toEqual(p.completed);
    expect(next.blendCompleted).toEqual(p.blendCompleted);
    expect(next.speakingCompleted).toBe(p.speakingCompleted);
    expect(fuel(reconcileRewards(next).space)).toBe(fuel(p.space));
  });
  it("records a prompted attempt honestly and prioritizes a word needing help", () => {
    let p = startPractice(completeThrough(0));
    const first = p.practice!.session!.itemIds[0];
    p = observePractice(hintPractice(p, first), first, "independent");
    expect(p.practice!.observations[0].outcome).toBe("prompted");
    const word = p.practice!.session!.itemIds[1];
    p = observePractice(p, word, "together");
    expect(startPractice(p, true).practice!.session!.itemIds).toContain(word);
  });
  it("restores the draft, hint use, observations and volume across reload and course changes", () => {
    let p = startPractice({ ...completeThrough(0), blendDraft: ["a"], blendSolved: false, volume: .3 });
    const id = p.practice!.session!.itemIds[0];
    p = observePractice(p, id, "independent");
    p = hintPractice(p, p.practice!.session!.itemIds[1]);
    const restored = parseProgress(JSON.stringify(p));
    expect(restored.practice).toEqual(p.practice);
    expect(restored.page).toBe("practice");
    expect(restored.blendDraft).toEqual(["a"]);
    expect(restored.volume).toBe(.3);
    const switched = selectCourse(restored, 1);
    expect(parseProgress(JSON.stringify(switched)).practice).toEqual(p.practice);
  });
  it("discards malformed sessions and never accepts an untaught task", () => {
    const p = parseProgress(JSON.stringify({ ...initialProgress, page: "practice", practice: { turn: 1, observations: [{ itemId: "word:quit", outcome: "independent", turn: 1 }], session: { itemIds: ["word:quit"], index: 0, hintedIds: [], outcomes: [] } } }));
    expect(p.page).toBe("map"); expect(p.practice?.observations).toEqual([]); expect(p.practice?.session).toBeUndefined();
  });
});
