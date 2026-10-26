#!/bin/sh
# Synthetic US-English preview clips; require human review before teaching.
set -eu
cd "$(dirname "$0")/.."
mkdir -p public/audio/shop
shop_tmp=$(mktemp -d)
trap 'rm -rf "$shop_tmp"' EXIT
while IFS='|' read -r name phrase; do
 say -v Samantha -r 120 -o "$shop_tmp/$name.aiff" "$phrase"
 ffmpeg -loglevel error -y -i "$shop_tmp/$name.aiff" -codec:a libmp3lame -q:a 3 "public/audio/shop/$name.mp3"
done <<'CLIPS'
welcome|Hello! Welcome to my shop!
hello|Hello!
want|What do you want?
want-apple|I want an apple, please.
want-gem|I want a gem, please.
give-apple|Here is your apple!
give-gem|Here is your gem!
thank-you|Thank you!
goodbye|You're welcome! Have a great trip!
bye|Bye!
CLIPS
