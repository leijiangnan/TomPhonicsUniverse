#!/bin/sh
# Preview-only US English clips; pending human review.
set -eu
cd "$(dirname "$0")/.."
mkdir -p public/audio/station
station_tmp=$(mktemp -d)
trap 'rm -rf "$station_tmp"' EXIT
while IFS='|' read -r name phrase; do
 say -v Samantha -r 120 -o "$station_tmp/$name.aiff" "$phrase"
 ffmpeg -loglevel error -y -i "$station_tmp/$name.aiff" -codec:a libmp3lame -q:a 3 "public/audio/station/$name.mp3"
done <<'CLIPS'
welcome|Hello, explorer!
supply|Here is your fuel cell!
goodbye|Have a great trip!
CLIPS
