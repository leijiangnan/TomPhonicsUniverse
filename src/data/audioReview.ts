import { lessons } from "./lesson";
import { reviewUnits } from "./reviews";
import { clip, shopItems, shopNodes } from "./dialogues/shop";
import { stationLines } from "./space/station";

export function audioReviewRows() {
  const rows = new Map<string, Set<string>>();
  const add = (audio: string, target: string) => {
    if (!audio) return;
    const targets = rows.get(audio) ?? new Set<string>();
    targets.add(target); rows.set(audio, targets);
  };
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      add(step.audio, `字母音 ${step.grapheme} ${step.ipa}`);
      for (const word of step.words) add(word.audio, `整词 ${word.word} ${word.ipa ?? ""}`);
    }
    for (const round of lesson.blendRounds) add(round.audio, `拼读词 ${round.word} ${round.ipa ?? ""}`);
    add(lesson.speakingTask.questionAudio, lesson.speakingTask.question);
    add(lesson.speakingTask.answerAudio, lesson.speakingTask.answer);
  }
  for (const review of Object.values(reviewUnits)) for (const line of review.dialogue) {
    add(line.npcAudio, line.npc); add(line.replyAudio, line.reply);
  }
  for (const node of Object.values(shopNodes)) { add(node.audio, node.npc); add(node.model, node.answer); }
  for (const [item, detail] of Object.entries(shopItems)) {
    add(detail.audio, detail.sentence); add(clip(`give-${item}`), `Here is your ${item}!`);
  }
  for (const line of stationLines) { add(line.npcAudio, line.npc); add(line.replyAudio, line.reply); }
  return [...rows].sort(([a], [b]) => a.localeCompare(b)).map(([audio, targets]) => ({ audio, target: [...targets].join("；"), status: "待人工校对" as const }));
}
export function audioReviewCsv() {
  const quote = (text: string) => `"${text.replaceAll('"', '""')}"`;
  return "\uFEFF" + [["文件路径", "预期读音或台词", "校对状态", "审核人", "审核日期", "替换或问题记录"],
    ...audioReviewRows().map((row) => [row.audio, row.target, row.status, "", "", ""])]
    .map((row) => row.map(quote).join(",")).join("\r\n");
}
