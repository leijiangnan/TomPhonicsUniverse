import { lessons } from "../data/lesson";
import { reviewForLesson } from "../data/reviews";
import type { Progress } from "./progress";

function addIndex(values: number[], value: number) {
  return [...new Set([...values, value])].sort((a, b) => a - b);
}

export function completeReviewSound(progress: Progress): Progress {
  const lesson = lessons[progress.lessonIndex];
  if (!reviewForLesson(lesson.id)) return progress;
  return {
    ...progress,
    completed: addIndex(progress.completed, progress.step),
    reviewSounds: addIndex(progress.reviewSounds, progress.step),
    step: Math.min(progress.step + 1, lesson.steps.length - 1),
  };
}

export function placeReviewWord(
  progress: Progress,
  roundIndex: number,
): Progress {
  const lesson = lessons[progress.lessonIndex];
  if (
    !reviewForLesson(lesson.id) ||
    !lesson.steps.every((_, i) => progress.completed.includes(i)) ||
    !Number.isInteger(roundIndex) ||
    roundIndex < 0 ||
    roundIndex >= lesson.blendRounds.length
  )
    return progress;
  return {
    ...progress,
    blendCompleted: addIndex(progress.blendCompleted, roundIndex),
    reviewPlacements: addIndex(progress.reviewPlacements, roundIndex),
  };
}

export function reviewPlacementDone(progress: Progress) {
  const lesson = lessons[progress.lessonIndex];
  return (
    reviewForLesson(lesson.id) !== undefined &&
    lesson.blendRounds.every((_, i) => progress.reviewPlacements.includes(i))
  );
}

export function advanceReviewDialogue(progress: Progress): Progress {
  const lesson = lessons[progress.lessonIndex];
  const review = reviewForLesson(lesson.id);
  if (!review || !lesson.blendRounds.every((_, i) =>
    progress.blendCompleted.includes(i)
  ))
    return progress;
  const next = Math.min(
    progress.reviewDialogueStep + 1,
    review.dialogue.length,
  );
  return {
    ...progress,
    reviewDialogueStep: next,
    speakingCompleted: next === review.dialogue.length,
  };
}
