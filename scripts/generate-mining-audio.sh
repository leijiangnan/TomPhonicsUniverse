#!/bin/sh
# Preview-only US English words and sentences; human review is required.
set -eu
cd "$(dirname "$0")/.."
mining_tmp=$(mktemp -d)
trap 'rm -rf "$mining_tmp"' EXIT
while IFS='|' read -r name phrase; do
  say -v Samantha -r 120 -o "$mining_tmp/$name.aiff" "$phrase"
  ffmpeg -loglevel error -y -i "$mining_tmp/$name.aiff" -codec:a libmp3lame -q:a 3 "public/audio/$name.mp3"
done <<'CLIPS'
web|web
wind|wind
window|window
jam|jam
jet|jet
jug|jug
win|win
wet|wet
van|van
vet|vet
vest|vest
zip|zip
zebra|zebra
zoo|zoo
box|box
six|six
yak|yak
yellow|yellow
yo-yo|yo-yo
queen|queen
quilt|quilt
quiz|quiz
yes|yes
quit|quit
cut|cut
stop|stop
frog|frog
what-do-you-want|What do you want?
i-want-a-fan|I want a fan.
i-want-a-van|I want a van.
can-i-have-a-fan|Can I have a fan?
here-you-are|Here you are.
what-do-you-have|What do you have?
i-have-a-fan|I have a fan.
i-have-a-pen|I have a pen.
its-a-big-frog|It's a big frog.
i-want-a-fan-please|I want a fan, please.
CLIPS
