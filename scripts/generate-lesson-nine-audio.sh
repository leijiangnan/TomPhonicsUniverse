#!/bin/sh
# Lesson 9 preview clips; human pronunciation review is still required.
set -eu
cd "$(dirname "$0")/.."
lesson_tmp=$(mktemp -d)
trap 'rm -rf "$lesson_tmp"' EXIT
while IFS='|' read -r name phrase; do
  say -v Samantha -r 120 -o "$lesson_tmp/$name.aiff" "$phrase"
  ffmpeg -loglevel error -y -i "$lesson_tmp/$name.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$name.mp3"
done <<'CLIPS'
fan|fan
fish|fish
fox|fox
leaf|leaf
leg|leg
lion|lion
lip|lip
fit|fit
its-a-fan|It's a fan.
CLIPS
