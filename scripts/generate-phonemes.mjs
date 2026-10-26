import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import initialize from "@echogarden/espeak-ng-emscripten";

// Explicit eSpeak phoneme notation. synthesize() enables espeakPHONEMES;
// synthesize_and_get_phonemes() uses different flags and must not replace it.
const module = await initialize();
const speaker = new module.eSpeakNGWorker();
speaker.set_voice("en-us");
speaker.set_rate(90);
const selected = new Set(process.argv.slice(2));
for (const [letter, notation, ipa] of [
  ["s", "s:", "s"],
  ["a", "a", "æ"],
  ["t", "t", "t"],
  ["p", "p", "p"],
  ["i", "'I", "ɪ"],
  ["n", "n:", "n"],
  ["m", "m:", "m"],
  ["d", "d", "d"],
  // eSpeak reports its explicit American open-o sample as /ɑː/; the clip
  // remains an unreviewed prototype for the short-o lesson.
  ["o", "0", "ɑː"],
  ["c", "k", "k"],
  ["k", "k", "k"],
  ["e", "E", "ɛ"],
  ["h", "h", "h"],
  ["r", "R", "r"],
  ["b", "b", "b"],
  ["g", "g", "ɡ"],
  ["u", "V", "ʌ"],
]) {
  if (selected.size && !selected.has(letter)) continue;
  const chunks = [];
  const phonemes = [];
  speaker.synthesize(`[[${notation}]]`, (samples, events) => {
    if (samples?.length)
      chunks.push(
        Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength),
      );
    for (const event of events) {
      if (event.type === "phoneme" && event.id)
        phonemes.push(event.id.replace(/[ˈˌ]/g, ""));
    }
  });
  assert.deepEqual(phonemes, [ipa], `Unexpected phonemes for ${letter}`);
  const samples = Buffer.concat(chunks);
  assert(samples.length > 1000, "Audio must contain samples");
  const output = fileURLToPath(
    new URL(`../public/audio/phoneme-${letter}.mp3`, import.meta.url),
  );
  const result = spawnSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-y",
      "-f",
      "s16le",
      "-ar",
      "22050",
      "-ac",
      "1",
      "-i",
      "pipe:0",
      "-af",
      "apad=pad_dur=0.25",
      "-codec:a",
      "libmp3lame",
      "-q:a",
      "3",
      output,
    ],
    { input: samples, encoding: "buffer" },
  );
  assert.equal(result.status, 0, result.stderr?.toString());
  console.log(
    `Generated ${letter}: /${ipa}/; no additional phonemes. Pending human review.`,
  );
}
module.destroy(speaker);
