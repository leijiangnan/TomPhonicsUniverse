/** Words that can pop into a short 3D reward after a real success. */
export const wordLifeWords = ["at", "sat", "hen", "bug", "box"] as const;
export type WordLifeWord = (typeof wordLifeWords)[number];

export const wordLifeLabels: Record<WordLifeWord, string> = {
  at: "在星星旁",
  sat: "坐下的宇航员",
  hen: "母鸡",
  bug: "小虫",
  box: "盒子",
};

const rewardWords = new Set<string>(wordLifeWords);

/**
 * A reward is the whole spelling target (`hen`) or one token inside a review
 * phrase (`red hen`). Substrings and mixed rewards are ignored.
 */
export function wordLifeReward(text: string): WordLifeWord | null {
  const hits = text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => rewardWords.has(token));
  return hits.length === 1 ? (hits[0] as WordLifeWord) : null;
}

export type WordLifePresentation = "animated" | "still";

/** Animated only when the family allows motion and WebGL is actually available. */
export function wordLifePresentation({
  text,
  ambientMotion,
  reducedMotion,
  webgl,
}: {
  text: string;
  ambientMotion: boolean;
  reducedMotion: boolean;
  webgl: boolean;
}): { word: WordLifeWord; presentation: WordLifePresentation } | null {
  const word = wordLifeReward(text);
  if (!word) return null;
  const animated = ambientMotion && !reducedMotion && webgl;
  return { word, presentation: animated ? "animated" : "still" };
}

/**
 * Blending scope includes the round, so moving to the next word clears the
 * reward. Practice scope stays on the lesson, so recording an observation can
 * advance the card without unmounting the reward before the child skips it.
 */
export function wordLifeScope(page: string, lessonIndex: number, blendRound: number) {
  if (page === "blending") return `blending:${lessonIndex}:${blendRound}`;
  if (page === "practice") return `practice:${lessonIndex}`;
  return page;
}

export const WORD_LIFE_MS = 2600;

export type WordLifeSample = {
  progress: number;
  scale: number;
  spin: number;
  hop: number;
  /** 0 is tucked in, 1 is the liveliest pose. Settled models rest a little open. */
  life: number;
  settled: boolean;
};

const REST_LIFE = 0.35;
const settledSample: WordLifeSample = {
  progress: 1,
  scale: 1,
  spin: 0,
  hop: 0,
  life: REST_LIFE,
  settled: true,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/**
 * Pop with one full turn, then hop while staying turned toward the camera,
 * then rest. The lively hop no longer hides the face.
 */
export function wordLifeSample(elapsed: number, duration = WORD_LIFE_MS): WordLifeSample {
  if (!(duration > 0) || !Number.isFinite(elapsed)) return settledSample;
  const progress = clamp01(elapsed / duration);
  if (progress >= 1) return settledSample;
  const popEnd = 0.34;
  const hopEnd = 0.82;
  if (progress < popEnd) {
    const pop = smooth(progress / popEnd);
    return {
      progress,
      scale: 0.2 + 0.8 * pop + Math.sin(pop * Math.PI) * 0.06,
      spin: pop * Math.PI * 2,
      hop: 0,
      life: REST_LIFE * pop,
      settled: false,
    };
  }
  const move = clamp01((progress - popEnd) / (hopEnd - popEnd));
  const settling = progress <= hopEnd ? 0 : smooth((progress - hopEnd) / (1 - hopEnd));
  const energy = 1 - settling;
  const hopWindow = Math.sin(move * Math.PI);
  return {
    progress,
    scale: 1 + hopWindow * 0.05 * energy,
    spin: Math.sin(move * Math.PI * 2) * 0.4 * energy,
    hop: hopWindow * 0.58 * energy,
    life: REST_LIFE + (1 - REST_LIFE) * hopWindow * energy,
    settled: false,
  };
}
