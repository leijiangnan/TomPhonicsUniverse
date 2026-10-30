import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import initialize from "@echogarden/espeak-ng-emscripten";

const module = await initialize();
const speaker = new module.eSpeakNGWorker();
speaker.set_voice("en-us");
speaker.set_rate(90);
const chunks = [];
const phonemes = [];
speaker.synthesize("[[kw]]", (samples, events) => {
  if (samples?.length) chunks.push(Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength));
  for (const event of events)
    if (event.type === "phoneme" && event.id) phonemes.push(event.id.replace(/[ˈˌ]/g, ""));
});
assert.deepEqual(phonemes, ["k", "w"]);
const samples = Buffer.concat(chunks);
assert(samples.length > 1000);
const result = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "s16le", "-ar", "22050", "-ac", "1", "-i", "pipe:0", "-af", "apad=pad_dur=0.25", "-codec:a", "libmp3lame", "-q:a", "3", fileURLToPath(new URL("../public/audio/phoneme-qu.mp3", import.meta.url))], { input: samples });
assert.equal(result.status, 0, result.stderr?.toString());
module.destroy(speaker);
console.log("Generated qu from /k/ + /w/; pending human review.");
