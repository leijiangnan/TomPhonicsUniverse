import { lessons, type Lesson } from "./lesson";

// Explicit mappings for the rules taught in lessons 1–16, not a general G2P engine.
export const taughtPhonemes: Readonly<Record<string, readonly string[]>> = {
  s: ["s"], a: ["æ"], t: ["t"], p: ["p"], i: ["ɪ"], n: ["n"],
  m: ["m"], d: ["d"], o: ["ɑ"], c: ["k"], k: ["k"], e: ["ɛ"],
  h: ["h"], r: ["r"], b: ["b"], g: ["ɡ"], u: ["ʌ"], f: ["f"],
  l: ["l"], w: ["w"], j: ["dʒ"], v: ["v"], z: ["z"],
  x: ["k", "s"], y: ["j"], qu: ["k", "w"],
};

export function wordSegments(word: string) {
  return (word.match(/qu|./g) ?? []).map((grapheme) => ({
    grapheme,
    phonemes: taughtPhonemes[grapheme] ?? [],
    audio: lessons.flatMap((lesson) => lesson.steps).find((s) => s.id === grapheme)?.audio,
  }));
}

export const readingPhrases = [
  { id: "phrase:red-hen", text: "red hen", usageType: "decodable", meaning: "红色的母鸡", lessonIndex: 5, words: ["red", "hen"], requires: ["r", "e", "d", "h", "n"] },
  { id: "phrase:big-bug", text: "big bug", usageType: "decodable", meaning: "大虫子", lessonIndex: 6, words: ["big", "bug"], requires: ["b", "i", "g", "u"] },
  { id: "phrase:big-box", text: "big box", usageType: "decodable", meaning: "大盒子", lessonIndex: 11, words: ["big", "box"], requires: ["b", "i", "g", "o", "x"] },
] as const;

// Familiar spoken words can be tried in print only after their rules are taught.
export const transferWords = [
  { id: "word:pan", text: "pan", usageType: "decodable", meaning: "平底锅", lessonIndex: 1, audio: ["/audio/pan.mp3"], requires: ["p", "a", "n"] },
  { id: "word:mat", text: "mat", usageType: "decodable", meaning: "垫子", lessonIndex: 2, audio: ["/audio/mat.mp3"], requires: ["m", "a", "t"] },
] as const;

export function lessonGuide(lesson: Lesson) {
  return {
    goal: lesson.id === "mission-003" ? "找回地图，把它带上飞船。" : lesson.title,
    sounds: lesson.steps.map((step) => `${step.grapheme} ${step.ipa}`).join(" · "),
    words: lesson.blendRounds.map((round) => round.word),
    expression: lesson.id === "mission-001" ? "Hello! / I want… / Thank you! / Bye!" : lesson.speakingTask.answer,
    support: lesson.review
      ? lesson.learningNote ?? "先让孩子尝试，再按需要示范。声音扫描和词语归位连续两次错误后会提供高亮提示。"
      : "先示范字母音，避免读成字母名称或附加元音。三个图片词用于听说，不要求全部独立拼读。",
  };
}
