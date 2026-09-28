#!/bin/sh
# Pull the client's own media and licensed fonts from a local Zemyth website checkout into assets/
# (git-ignored: not redistributable).
#   footage/<clip>/0001.jpg … — frame sequences (29.97 fps) so every output frame can fetch its exact source frame
#   img/*.jpg — documentary photos, resized for film scale
set -e
SITE=${ZEMYTH_SITE:-$HOME/Documents/zebra/Zemyth-website}
U=${ZEMYTH_UPLOADS:-$SITE/public/uploads}
A=$(dirname "$0")/../assets
seq() { # name src start dur width
  mkdir -p "$A/footage/$1"; rm -f "$A/footage/$1"/*.jpg
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$U/$2.mp4" -vf "scale=$5:-2:flags=lanczos" -q:v 3 -start_number 0 "$A/footage/$1/%04d.jpg"
  echo "$1: $(ls "$A/footage/$1" | wc -l | tr -d ' ') frames"
}
seq day1 breakfast-timelapse 0.0 3.0 1280
seq day2 everyone-building-2-timelapse 1.5 3.0 1280
seq day3 dinner-timelapse 2.0 3.0 1280
seq day4 demo-day-timelapse 0.0 3.0 1280
seq house hero-zemyth 2.0 6.5 1920
mkdir -p "$A/img"
for f in focused-coder-with-tshirt-tee thinking-coder-at-laptop glasses-guy-working-by-zemyth-banner two-developers-coding-side-by-side \
         hands-up-explaining-at-laptop laptop-chat-by-zemyth-banner hijabi-listening-to-dream-computer-shirt three-guys-looking-at-phone \
         hoodie-girl-with-juicebox-talking abel-profile bede-profile faris-profile haniya-profile hiro-profile sky-profile; do
  ffmpeg -v error -y -i "$U/$f.jpg" -vf "scale='min(1400,iw)':-2:flags=lanczos" -q:v 3 "$A/img/$f.jpg"
done
echo "img: $(ls "$A/img" | wc -l | tr -d ' ') photos"
mkdir -p "$A/fonts"
cp "$U/ZEMITH_Font_Family/refinery-95-bold.ttf" "$SITE/public/fonts/BlenderPro-Bold.ttf" "$SITE/public/fonts/BlenderPro-Book.ttf" "$A/fonts/"
echo "fonts: Refinery 95 Bold, Blender Pro (licensed, local only)"
