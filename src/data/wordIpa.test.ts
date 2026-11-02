import { describe, expect, it } from "vitest";
import { lessons } from "./lesson";
import { reviewUnits } from "./reviews";

describe("课程单词音标", () => {
  it("covers every displayed lesson word and blending answer", () => {
    for (const lesson of lessons) {
      for (const word of lesson.steps.flatMap((step) => step.words)) {
        expect(word.ipa, `${lesson.id}: ${word.word}`).toMatch(/^\/.+\/$/);
      }
      for (const word of lesson.blendRounds) {
        expect(word.ipa, `${lesson.id}: ${word.word}`).toMatch(/^\/.+\/$/);
      }
    }
  });

  it("covers every review scene word", () => {
    for (const review of Object.values(reviewUnits)) {
      const items = [...review.placementItems, ...review.soundBatches.flatMap((batch) => batch.items)];
      for (const item of items) {
        expect(item.ipa, `${review.lessonId}: ${item.word}`).toMatch(/^\/.+\/$/);
      }
    }
  });
});
