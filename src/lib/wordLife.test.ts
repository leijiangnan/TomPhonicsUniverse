import { describe, expect, it } from "vitest";
import { lessons } from "../data/lesson";
import { readingPhrases } from "../data/learning";
import {
  WORD_LIFE_MS,
  wordLifePresentation,
  wordLifeReward,
  wordLifeSample,
  wordLifeScope,
  wordLifeWords,
} from "./wordLife";

describe("word life reward selection", () => {
  it("rewards only hen, bug, and box, including their review phrases", () => {
    expect(wordLifeWords).toEqual(["hen", "bug", "box"]);
    expect(["hen", "bug", "box", "red hen", "big bug", "big box"].map(wordLifeReward)).toEqual([
      "hen", "bug", "box", "hen", "bug", "box",
    ]);
    for (const text of ["fox", "six", "then", "buggy", "hen bug", "red", ""]) {
      expect(wordLifeReward(text)).toBeNull();
    }
  });

  it("matches the spelling targets and review phrases actually in the course", () => {
    const targets = lessons.flatMap((lesson) => lesson.blendRounds.map((round) => round.word));
    expect(targets.filter((word) => wordLifeReward(word))).toEqual(["hen", "bug", "box", "box"]);
    expect(readingPhrases.map((phrase) => phrase.text).filter((text) => wordLifeReward(text))).toEqual([
      "red hen", "big bug", "big box",
    ]);
  });

  it("uses the still picture when motion or WebGL is unavailable", () => {
    expect(wordLifePresentation({ text: "hen", ambientMotion: true, reducedMotion: false, webgl: true }))
      .toEqual({ word: "hen", presentation: "animated" });
    for (const flags of [
      { ambientMotion: false, reducedMotion: false, webgl: true },
      { ambientMotion: true, reducedMotion: true, webgl: true },
      { ambientMotion: true, reducedMotion: false, webgl: false },
    ]) {
      expect(wordLifePresentation({ text: "big box", ...flags })).toEqual({ word: "box", presentation: "still" });
    }
    expect(wordLifePresentation({ text: "sat", ambientMotion: true, reducedMotion: false, webgl: true })).toBeNull();
  });

  it("keeps a blending reward on its round and a practice reward on the lesson", () => {
    expect(wordLifeScope("blending", 5, 0)).toBe("blending:5:0");
    expect(wordLifeScope("blending", 5, 1)).not.toBe(wordLifeScope("blending", 5, 0));
    expect(wordLifeScope("practice", 11, 0)).toBe(wordLifeScope("practice", 11, 4));
    expect(wordLifeScope("map", 0, 0)).toBe("map");
  });

  it("pops, hops once, and then rests", () => {
    const start = wordLifeSample(0);
    expect(start.settled).toBe(false);
    expect(start.scale).toBeLessThan(0.5);
    expect(start.hop).toBe(0);
    const twirl = wordLifeSample(WORD_LIFE_MS * 0.17);
    expect(twirl.hop).toBe(0);
    expect(twirl.spin).toBeGreaterThan(2);
    const hop = wordLifeSample(WORD_LIFE_MS * 0.56);
    expect(hop.hop).toBeGreaterThan(0.4);
    expect(Math.abs(hop.spin)).toBeLessThan(0.5);
    expect(hop.life).toBeGreaterThan(0.8);
    const done = wordLifeSample(WORD_LIFE_MS);
    expect(done).toEqual(wordLifeSample(WORD_LIFE_MS + 5000));
    expect(done).toMatchObject({ settled: true, scale: 1, spin: 0, hop: 0, life: 0.35 });
    expect(wordLifeSample(Number.NaN).settled).toBe(true);
  });
});
