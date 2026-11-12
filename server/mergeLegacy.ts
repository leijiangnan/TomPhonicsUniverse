import { lessons } from "../src/data/lesson";
import { courseDone, lessonProgress, lessonSnapshot, parseProgress, type LessonProgress, type Progress } from "../src/lib/progress";
import { restoreSpace, visitedNodes } from "../src/lib/space";
import { emptyPractice } from "../src/lib/practice";

const union = (a: number[], b: number[]) => [...new Set([...a, ...b])].sort((x, y) => x - y);
const farther = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
};
const lessonRank = (p: LessonProgress) => [Number(p.speakingCompleted), p.blendCompleted.length, p.completed.length,
  p.dialogue?.completed.length ?? 0, p.reviewDialogueStep, p.reviewPlacements.length, p.reviewSounds.length,
  p.blendRound, p.step, p.blendDraft.length];
const rank = (p: Progress) => [lessons.filter((_, i) => courseDone(p, i)).length,
  lessons.reduce((sum, _, i) => sum + lessonProgress(p, i).completed.length + lessonProgress(p, i).blendCompleted.length, 0), p.lessonIndex];

/** Used only once per legacy source, never to replay a stale ordinary save. */
export function mergeLegacyProgress(current: Progress, legacy: Progress): Progress {
  const preferred = farther(rank(legacy), rank(current)) ? legacy : current;
  const other = preferred === legacy ? current : legacy;
  const records: Record<string, LessonProgress> = {};
  for (const [n, lesson] of lessons.entries()) {
    const a = lessonSnapshot(lessonProgress(current, n)), b = lessonSnapshot(lessonProgress(legacy, n));
    const winner = farther(lessonRank(b), lessonRank(a)) ? b : a;
    const dialogue = a.dialogue && b.dialogue ? {
      ...(b.dialogue.completed.length > a.dialogue.completed.length ? b.dialogue : a.dialogue),
      rewards: [...new Set([...a.dialogue.rewards, ...b.dialogue.rewards])],
      assisted: [...new Set([...a.dialogue.assisted, ...b.dialogue.assisted])],
    } : a.dialogue ?? b.dialogue;
    const phonicsCards = Object.fromEntries([...new Set([...Object.keys(a.phonicsCards ?? {}), ...Object.keys(b.phonicsCards ?? {})])]
      .map((id) => [id, [...new Set([...(a.phonicsCards?.[id] ?? []), ...(b.phonicsCards?.[id] ?? [])])]]));
    records[lesson.id] = { ...winner, completed: union(a.completed, b.completed),
      phonicsCards,
      blendCompleted: union(a.blendCompleted, b.blendCompleted), speakingCompleted: a.speakingCompleted || b.speakingCompleted,
      reviewSounds: union(a.reviewSounds, b.reviewSounds), reviewPlacements: union(a.reviewPlacements, b.reviewPlacements),
      reviewDialogueStep: Math.max(a.reviewDialogueStep, b.reviewDialogueStep), ...(dialogue ? { dialogue } : {}) };
  }
  const active = records[lessons[preferred.lessonIndex].id];
  delete records[lessons[preferred.lessonIndex].id];
  const mainPractice = preferred.practice ?? emptyPractice(), extraPractice = other.practice ?? emptyPractice();
  const observations = [...mainPractice.observations];
  const seen = new Set(observations.map((o) => JSON.stringify(o)));
  let turn = Math.max(mainPractice.turn, extraPractice.turn);
  for (const observation of extraPractice.observations) {
    if (!seen.has(JSON.stringify(observation))) observations.push({ ...observation, turn: ++turn });
  }
  const visited = visitedNodes(legacy.space).length > visitedNodes(current.space).length ? legacy.space : current.space;
  const merged: Progress = { ...preferred, ...active, records,
    practice: { ...mainPractice, turn, observations: observations.slice(-120) },
    space: visited };
  if (!active.dialogue) delete merged.dialogue;
  merged.space = restoreSpace({ ...visited, stationStep: Math.max(current.space.stationStep, legacy.space.stationStep),
    transactions: [...current.space.transactions, ...legacy.space.transactions] }, merged);
  return parseProgress(JSON.stringify(merged));
}
