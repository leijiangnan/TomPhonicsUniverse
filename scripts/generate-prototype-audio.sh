#!/bin/sh
# macOS-only for whole words; phonemes use eSpeak with explicit phonetic input.
# Generated files are unreviewed prototypes, never certified teaching assets.
set -eu
cd "$(dirname "$0")/.."
audio_tmp=$(mktemp -d)
trap 'rm -rf "$audio_tmp"' EXIT
node scripts/generate-phonemes.mjs
for word in sun snake sock apple ant alligator top tiger turtle at sat pig pen pan ink insect igloo net nest nut map moon mouse dog duck dinosaur pin sit tap mad dip; do
  say -v Samantha -r 120 -o "$audio_tmp/$word.aiff" "$word"
  ffmpeg -loglevel error -y -i "$audio_tmp/$word.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$word.mp3"
done

for clip in what-is-it its-an-apple its-a-pig its-a-map; do
  case "$clip" in
    what-is-it) phrase='What is it?' ;;
    its-a-pig) phrase="It's a pig." ;;
    its-a-map) phrase="It's a map." ;;
    its-an-apple) phrase="It's an apple." ;;
  esac
  say -v Samantha -r 120 -o "$audio_tmp/$clip.aiff" "$phrase"
  ffmpeg -loglevel error -y -i "$audio_tmp/$clip.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$clip.mp3"
done

sh scripts/generate-shop-audio.sh

sh scripts/generate-station-audio.sh
