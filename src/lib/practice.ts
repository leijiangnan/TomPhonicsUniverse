import { lessons } from "../data/lesson";
import { readingPhrases, transferWords } from "../data/learning";
import type { Progress } from "./progress";

export type PracticeOutcome = "independent" | "prompted" | "together";
export type PracticeItem = {
  id: string;
  kind: "sound" | "word" | "phrase";
  text: string;
  meaning: string;
  audio: readonly string[];
  requires: readonly string[];
  lessonIndex: number;
  usageType?: "decodable";
  transfer?: boolean;
};
export type PracticeObservation = { itemId: string; outcome: PracticeOutcome; turn: number };
export type PracticeState = {
  turn: number;
  observations: PracticeObservation[];
  session?: { itemIds: string[]; index: number; hintedIds: string[]; outcomes: PracticeOutcome[] };
};
export const emptyPractice = (): PracticeState => ({ turn: 0, observations: [] });
export const outcomeLabels: Record<PracticeOutcome, string> = {
  independent: "自己完成", prompted: "提示后完成", together: "一起完成",
};
const unique = (items: PracticeItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
};
export const practiceItems = unique([
  ...transferWords.map((word): PracticeItem => ({ ...word, kind: "word", transfer: true })),
  ...lessons.flatMap((lesson, lessonIndex) => [
    ...lesson.steps.map((step): PracticeItem => ({ id: `sound:${step.id}`, kind: "sound", text: step.grapheme, meaning: step.ipa, audio: [step.audio], requires: [step.id], lessonIndex })),
    ...lesson.blendRounds.map((round): PracticeItem => ({ id: `word:${round.word}`, kind: "word", usageType: "decodable", text: round.word, meaning: round.meaning, audio: [round.audio], requires: round.requires, lessonIndex })),
  ]),
  ...readingPhrases.map((phrase): PracticeItem => ({ ...phrase, kind: "phrase", audio: phrase.words.map((word) => `/audio/${word}.mp3`) })),
]);

export function practicePool(progress: Progress): PracticeItem[] {
  const taught = new Set<string>();
  const started = new Set<number>();
  for (const [n, lesson] of lessons.entries()) {
    const record = n === progress.lessonIndex ? progress : progress.records[lesson.id];
    if (!record) continue;
    started.add(n);
    for (const index of record.completed) {
      const step = lesson.steps[index];
      if (step) taught.add(step.id);
    }
  }
  return practiceItems.filter((item) =>
    started.has(item.lessonIndex) && item.requires.every((rule) => taught.has(rule)),
  );
}

export function parsePractice(raw: unknown, progress: Progress): PracticeState {
  const clean = emptyPractice();
  if (!raw || typeof raw !== "object") return clean;
  const value = raw as Record<string, unknown>;
  clean.turn = Number.isSafeInteger(value.turn) && Number(value.turn) >= 0 ? Number(value.turn) : 0;
  const allowed = new Set(practicePool(progress).map((item) => item.id));
  if (Array.isArray(value.observations)) {
    clean.observations = value.observations.filter((item): item is PracticeObservation =>
      item && typeof item === "object" && allowed.has(item.itemId) &&
      Object.hasOwn(outcomeLabels, item.outcome) && Number.isSafeInteger(item.turn) &&
      item.turn > 0 && item.turn <= clean.turn,
    ).map(({ itemId, outcome, turn }) => ({ itemId, outcome, turn }))
      .sort((a, b) => a.turn - b.turn)
      .filter((item, i, items) => !i || item.turn !== items[i - 1].turn).slice(-120);
  }
  const session = value.session as PracticeState["session"];
  if (session && Array.isArray(session.itemIds) && session.itemIds.length > 0 && session.itemIds.length <= 3 &&
    new Set(session.itemIds).size === session.itemIds.length && session.itemIds.every((id) => allowed.has(id)) &&
    Number.isInteger(session.index) && session.index >= 0 && session.index <= session.itemIds.length &&
    Array.isArray(session.outcomes) && session.outcomes.length === session.index &&
    session.outcomes.every((outcome) => Object.hasOwn(outcomeLabels, outcome)) && Array.isArray(session.hintedIds)) {
    clean.session = { itemIds: [...session.itemIds], index: session.index, outcomes: [...session.outcomes],
      hintedIds: [...new Set(session.hintedIds.filter((id) => session.itemIds.includes(id)))] };
  }
  return clean;
}

export function startPractice(progress: Progress, fresh = false): Progress {
  const practice = progress.practice ?? emptyPractice();
  if (!fresh && practice.session && practice.session.index < practice.session.itemIds.length)
    return { ...progress, page: "practice" };
  const pool = practicePool(progress);
  if (!pool.length) return progress;
  const latest = new Map(practice.observations.map((item) => [item.itemId, item]));
  const selected: PracticeItem[] = [];
  function pick(kind: PracticeItem["kind"], transferOnly = false) {
    const options = pool.filter((item) => item.kind === kind && !selected.includes(item) && (!transferOnly || item.transfer));
    options.sort((a, b) => {
      const left = latest.get(a.id), right = latest.get(b.id);
      return Number(Boolean(right && right.outcome !== "independent")) - Number(Boolean(left && left.outcome !== "independent")) ||
        (left?.turn ?? 0) - (right?.turn ?? 0) || a.lessonIndex - b.lessonIndex || a.id.localeCompare(b.id);
    });
    if (options[0]) selected.push(options[0]);
  }
  pick("sound"); pick("word"); pick("phrase");
  if (selected.length < 3) pick("word", true);
  while (selected.length < Math.min(3, pool.length)) {
    const before = selected.length;
    pick("word");
    if (selected.length === before) pick("sound");
    if (selected.length === before) break;
  }
  return { ...progress, page: "practice", practice: { ...practice,
    session: { itemIds: selected.map((item) => item.id), index: 0, hintedIds: [], outcomes: [] } } };
}

export function hintPractice(progress: Progress, itemId: string): Progress {
  const practice = progress.practice;
  const session = practice?.session;
  if (!session || session.itemIds[session.index] !== itemId || session.hintedIds.includes(itemId)) return progress;
  return { ...progress, practice: { ...practice!, session: { ...session, hintedIds: [...session.hintedIds, itemId] } } };
}

export function observePractice(progress: Progress, itemId: string, outcome: PracticeOutcome): Progress {
  const practice = progress.practice;
  const session = practice?.session;
  if (!practice || !session || session.itemIds[session.index] !== itemId || !Object.hasOwn(outcomeLabels, outcome)) return progress;
  const result = outcome === "independent" && session.hintedIds.includes(itemId) ? "prompted" : outcome;
  const turn = practice.turn + 1;
  return { ...progress, practice: { turn,
    observations: [...practice.observations, { itemId, outcome: result, turn }].slice(-120),
    session: { ...session, index: session.index + 1, outcomes: [...session.outcomes, result] } } };
}
