#!/bin/sh
# macOS-only for whole words; phonemes use eSpeak with explicit phonetic input.
# Generated files are unreviewed prototypes, never certified teaching assets.
set -eu
cd "$(dirname "$0")/.."
audio_tmp=$(mktemp -d)
trap 'rm -rf "$audio_tmp"' EXIT
node scripts/generate-phonemes.mjs
for word in sun snake sock apple ant alligator top tiger turtle at sat pig pen pan ink insect igloo net nest nut map moon mouse dog duck dinosaur pin sit tap mad dip \
  octopus ox olive cat cup car key kite king cot cop kid \
  egg elephant elbow hat hand horse rabbit robot rain hen red pet \
  ball bed bus goat gift gum umbrella up uncle bug big mug mat rug; do
  say -v Samantha -r 120 -o "$audio_tmp/$word.aiff" "$word"
  ffmpeg -loglevel error -y -i "$audio_tmp/$word.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$word.mp3"
done

for clip in what-is-it its-an-apple its-a-pig its-a-map what-do-you-see i-see-a-map i-see-a-cat \
  what-do-you-like i-like-the-hen is-it-big-or-small its-a-big-bug i-see-a-red-bug \
  where-is-the-map its-on-the-screen are-we-ready yes-lets-go; do
  case "$clip" in
    what-is-it) phrase='What is it?' ;;
    its-a-pig) phrase="It's a pig." ;;
    its-a-map) phrase="It's a map." ;;
    its-an-apple) phrase="It's an apple." ;;
    what-do-you-see) phrase='What do you see?' ;;
    i-see-a-map) phrase='I see a map.' ;;
    i-see-a-cat) phrase='I see a cat.' ;;
    what-do-you-like) phrase='What do you like?' ;;
    i-like-the-hen) phrase='I like the hen.' ;;
    is-it-big-or-small) phrase='Is it big or small?' ;;
    its-a-big-bug) phrase="It's a big bug." ;;
    i-see-a-red-bug) phrase='I see a red bug.' ;;
    where-is-the-map) phrase='Where is the map?' ;;
    its-on-the-screen) phrase="It's on the screen." ;;
    are-we-ready) phrase='Are we ready?' ;;
    yes-lets-go) phrase="Yes, let's go!" ;;
  esac
  say -v Samantha -r 120 -o "$audio_tmp/$clip.aiff" "$phrase"
  ffmpeg -loglevel error -y -i "$audio_tmp/$clip.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$clip.mp3"
done

sh scripts/generate-shop-audio.sh

sh scripts/generate-station-audio.sh
