import { lessons } from "../data/lesson";
import { reviewForLesson } from "../data/reviews";
import { courseDone, lessonProgress, parseProgress, type Progress } from "./progress";
import { fuel } from "./space";

export const MAX_BACKUP_BYTES = 1_000_000;
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const stableJson = (value: unknown) => JSON.stringify(value, (_, item) => isObject(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
function invalid(message: string): never { throw new Error(message); }
function indices(value: unknown, count: number) {
  return Array.isArray(value) && value.every((n) => Number.isInteger(n) && n >= 0 && n < count) && new Set(value).size === value.length;
}
const sameIndices = (a: number[], b: number[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((n, i) => n === [...b].sort((x, y) => x - y)[i]);

export function backupSummary(progress: Progress) {
  return { completedCourses: lessons.filter((_, n) => courseDone(progress, n)).length,
    lesson: progress.lessonIndex + 1, fuel: fuel(progress.space), observations: progress.practice?.observations.length ?? 0 };
}
export function createBackup(progress: Progress) {
  return JSON.stringify({ format: "tom-phonics-backup", formatVersion: 1, exportedAt: new Date().toISOString(), progress }, null, 2);
}

export function readBackup(text: string): Progress {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) invalid("存档文件过大，请选择本站导出的 JSON 存档。");
  let document: unknown;
  try { document = JSON.parse(text); } catch { invalid("文件不是有效的 JSON，当前进度没有改变。"); }
  if (!isObject(document)) invalid("没有找到有效的学习存档。");
  const wrapped = Object.hasOwn(document, "format");
  if (wrapped && (document.format !== "tom-phonics-backup" || document.formatVersion !== 1)) invalid("暂不支持这种备份格式。");
  const source = wrapped ? document.progress : document;
  if (!isObject(source) || ![1, 2, 3, 4].includes(Number(source.version)) || typeof source.version !== "number") invalid("存档版本不受支持，当前进度没有改变。");
  const version = source.version as number;
  const requested = version >= 3 ? source.lessonIndex : 0;
  if (!Number.isInteger(requested) || Number(requested) < 0 || Number(requested) >= lessons.length) invalid("存档中的课次无效。");
  if (version >= 3 && !isObject(source.records)) invalid("存档缺少分课记录。");
  if (source.page !== undefined && !["map", "space", "courses", "lesson", "blending", "speaking", "practice"].includes(String(source.page))) invalid("存档中的页面无效。");
  const restored = parseProgress(JSON.stringify(source));
  if (restored.lessonIndex !== requested) invalid("课次的先备条件不完整，请检查存档。");
  if (version >= 3 && source.page !== undefined && source.page !== restored.page) invalid("当前页面的先备条件或练习草稿不完整。");
  const records = version >= 3 ? source.records as Record<string, unknown> : {};
  const entries = [[lessons[Number(requested)].id, source], ...Object.entries(records)] as const;
  for (const [id, raw] of entries) {
    const n = lessons.findIndex((lesson) => lesson.id === id);
    if (n < 0 || !isObject(raw)) invalid("存档包含无效的课程记录。");
    const legacyReview = reviewForLesson(id);
    const maxSteps = version === 1 ? 4 : lessons[n].steps.length;
    if (!indices(raw.completed, maxSteps) || !Number.isInteger(raw.step) || Number(raw.step) < 0 || Number(raw.step) >= maxSteps) invalid("字母学习记录不完整或含重复步骤。");
    if (version > 1) {
      const legacyReviewDone = legacyReview && !Object.hasOwn(raw, "reviewDialogueStep");
      if (!indices(raw.blendCompleted, legacyReviewDone ? legacyReview.legacyBlendRoundCount : lessons[n].blendRounds.length) ||
        !Array.isArray(raw.blendDraft) || !raw.blendDraft.every((value) => typeof value === "string") ||
        typeof raw.speakingCompleted !== "boolean" || typeof raw.blendSolved !== "boolean" ||
        !Number.isInteger(raw.blendRound) || Number(raw.blendRound) < 0 || Number(raw.blendRound) >= lessons[n].blendRounds.length) invalid("拼读或口语记录不完整。");
      const clean = lessonProgress(restored, n);
      if (!sameIndices(raw.completed as number[], clean.completed) ||
        (!legacyReviewDone && !sameIndices(raw.blendCompleted as number[], clean.blendCompleted)) || raw.speakingCompleted !== clean.speakingCompleted)
        invalid("学习记录与先备条件不一致，当前进度没有改变。");
      if (!legacyReviewDone && (raw.step !== clean.step || raw.blendRound !== clean.blendRound ||
        JSON.stringify(raw.blendDraft) !== JSON.stringify(clean.blendDraft) || raw.blendSolved !== clean.blendSolved)) invalid("存档中的题目或拼字草稿无效。");
      if (legacyReview && !legacyReviewDone) {
        for (const field of ["reviewSounds", "reviewPlacements"] as const) {
          if (Object.hasOwn(raw, field) && (!indices(raw[field], field === "reviewSounds" ? lessons[n].steps.length : lessons[n].blendRounds.length) || !sameIndices(raw[field] as number[], clean[field]))) invalid("场景复习草稿无效。");
        }
        if (raw.reviewDialogueStep !== undefined && raw.reviewDialogueStep !== clean.reviewDialogueStep) invalid("场景对话进度无效。");
      }
    }
  }
  if (typeof source.volume !== "number" || !Number.isFinite(source.volume) || source.volume < 0 || source.volume > 1) invalid("存档中的音量无效。");
  if (version === 4) {
    const space = source.space;
    if (!isObject(space) || !["earth", "station"].includes(String(space.current)) || !Array.isArray(space.transactions) || space.transactions.length > 1000 ||
      !Number.isInteger(space.stationStep) || Number(space.stationStep) < 0 || Number(space.stationStep) > 3 || typeof space.badge !== "boolean") invalid("探索存档不完整。");
    const expected = new Map(restored.space.transactions.map((transaction) => [transaction.id, transaction.amount]));
    const seen = new Set<string>();
    for (const transaction of space.transactions) {
      if (!isObject(transaction) || typeof transaction.id !== "string" || seen.has(transaction.id) || expected.get(transaction.id) !== transaction.amount)
        invalid("燃料账本含无效金额或重复事件，当前进度没有改变。");
      seen.add(transaction.id);
    }
    if (space.current !== restored.space.current || space.stationStep !== restored.space.stationStep || space.badge !== restored.space.badge)
      invalid("探索位置或收藏与燃料账本不一致。");
    if (source.practice && stableJson(source.practice) !== stableJson(restored.practice)) invalid("复习记录无效，请检查备份文件。");
  }
  return restored;
}
