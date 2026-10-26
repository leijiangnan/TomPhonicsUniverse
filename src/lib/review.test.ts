import { describe, expect, it } from "vitest";
import { lessons } from "../data/lesson";
import { reviewUnits } from "../data/reviews";
import { reconcileRewards } from "./space";
import {
  courseDone,
  initialProgress,
  type LessonProgress,
  parseProgress,
  type Progress,
} from "./progress";
import {
  advanceReviewDialogue,
  completeReviewSound,
  placeReviewWord,
  reviewPlacementDone,
} from "./review";

function doneRecord(lessonIndex: number): LessonProgress {
  const lesson = lessons[lessonIndex];
  const review =
    reviewUnits[lesson.id as "mission-004" | "mission-008"];
  return {
    step: lesson.steps.length - 1,
    completed: lesson.steps.map((_, i) => i),
    blendRound: 0,
    blendCompleted: lesson.blendRounds.map((_, i) => i),
    blendDraft: [],
    blendSolved: false,
    speakingCompleted: true,
    reviewSounds: review ? lesson.steps.map((_, i) => i) : [],
    reviewPlacements: review
      ? lesson.blendRounds.map((_, i) => i)
      : [],
    reviewDialogueStep: review?.dialogue.length ?? 0,
  };
}

function reviewState(lessonIndex: 3 | 7): Progress {
  return {
    ...initialProgress,
    lessonIndex,
    records: Object.fromEntries(
      lessons
        .slice(0, lessonIndex)
        .map((lesson, i) => [lesson.id, doneRecord(i)]),
    ),
  };
}

describe("scene review lessons", () => {
  it.each([3, 7] as const)(
    "completes lesson %s in sound, placement and dialogue stages",
    (lessonIndex) => {
      const lesson = lessons[lessonIndex];
      const review = reviewUnits[lesson.id as "mission-004" | "mission-008"];
      let state = reviewState(lessonIndex);
      for (const _ of lesson.steps) state = completeReviewSound(state);
      expect(state.reviewSounds).toEqual(lesson.steps.map((_, i) => i));
      expect(state.completed).toEqual(lesson.steps.map((_, i) => i));

      expect(placeReviewWord(state, -1)).toBe(state);
      for (const i of lesson.blendRounds.keys())
        state = placeReviewWord(state, i);
      expect(reviewPlacementDone(state)).toBe(true);
      expect(state.blendCompleted).toEqual(
        lesson.blendRounds.map((_, i) => i),
      );

      for (const _ of review.dialogue)
        state = advanceReviewDialogue(state);
      expect(state.reviewDialogueStep).toBe(review.dialogue.length);
      expect(state.speakingCompleted).toBe(true);
      expect(courseDone(state, lessonIndex)).toBe(true);
      expect(parseProgress(JSON.stringify(state))).toEqual(
        reconcileRewards(state),
      );
    },
  );

  it("restores partial placement and dialogue without granting completion", () => {
    let state = reviewState(7);
    for (const _ of lessons[7].steps) state = completeReviewSound(state);
    state = placeReviewWord(state, 0);
    state = placeReviewWord(state, 1);
    state = {
      ...state,
      page: "blending",
      blendRound: 0,
    };
    const restored = parseProgress(JSON.stringify(state));
    expect(restored.reviewPlacements).toEqual([0, 1]);
    expect(restored.speakingCompleted).toBe(false);
    expect(courseDone(restored, 7)).toBe(false);
  });

  it("keeps lesson eight placement batches independent", () => {
    let state = reviewState(7);
    for (const _ of lessons[7].steps) state = completeReviewSound(state);
    for (const i of [0, 1, 2, 3]) state = placeReviewWord(state, i);
    expect(
      reviewUnits["mission-008"].placementBatches[0].every((word) => {
        const index = lessons[7].blendRounds.findIndex(
          (round) => round.word === word,
        );
        return state.reviewPlacements.includes(index);
      }),
    ).toBe(true);
    expect(reviewPlacementDone(state)).toBe(false);
  });

  it("migrates the old completed review formats without relocking lessons", () => {
    const current = reviewState(3);
    const legacyFourth: Record<string, unknown> = {
      ...reviewState(3),
      completed: lessons[3].steps.map((_, i) => i),
      blendCompleted: [0, 1, 2],
      speakingCompleted: true,
    };
    delete legacyFourth.reviewSounds;
    delete legacyFourth.reviewPlacements;
    delete legacyFourth.reviewDialogueStep;
    const fourth = parseProgress(JSON.stringify(legacyFourth));
    expect(courseDone(fourth, 3)).toBe(true);
    expect(fourth.reviewPlacements).toEqual([0, 1, 2, 3]);
    expect(fourth.reviewDialogueStep).toBe(1);
    expect(fourth.records).toEqual(current.records);

    const legacyEighth: Record<string, unknown> = {
      ...reviewState(7),
      completed: lessons[7].steps.map((_, i) => i),
      blendCompleted: [0, 1, 2, 3],
      speakingCompleted: true,
    };
    delete legacyEighth.reviewSounds;
    delete legacyEighth.reviewPlacements;
    delete legacyEighth.reviewDialogueStep;
    const eighth = parseProgress(JSON.stringify(legacyEighth));
    expect(courseDone(eighth, 7)).toBe(true);
    expect(eighth.reviewPlacements).toEqual(
      lessons[7].blendRounds.map((_, i) => i),
    );
    expect(eighth.reviewDialogueStep).toBe(3);
  });
});
