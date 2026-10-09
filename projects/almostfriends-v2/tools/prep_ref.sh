#!/bin/zsh
# Prepare one reference video for study: cut list, cut sheet, timed contact sheets, audio stats.
# usage: prep_ref.sh <video.mp4> <outdir>
set -e
v=$1; o=$2; mkdir -p $o/frames
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $v)
# 1. hard cuts (scene score > 0.3)
ffmpeg -hide_banner -nostats -i $v -vf "select='gt(scene,0.3)',metadata=print:file=$o/cuts.txt" -an -f null - 2>/dev/null
grep -o 'pts_time:[0-9.]*' $o/cuts.txt | cut -d: -f2 > $o/cuts.list || true
# 2. one frame every 0.5 s, timestamp burned in, tiled 6x5 per sheet (15 s/sheet)
ffmpeg -hide_banner -loglevel error -i $v -vf "fps=2,scale=480:-2" -q:v 3 $o/frames/h_%04d.jpg && python3 ${0:A:h}/ref_sheet.py $o/frames $o/sheet
# 3. full-res stills at 1 fps for detail
ffmpeg -hide_banner -loglevel error -i $v -vf "fps=1" -q:v 3 $o/frames/s_%03d.jpg
# 4. audio: loudness + per-second RMS
ffmpeg -hide_banner -nostats -i $v -af ebur128=framelog=quiet -f null - 2>&1 | grep -A3 'Integrated' | head -4 > $o/loudness.txt || true
ffmpeg -hide_banner -nostats -i $v -af "astats=metadata=1:reset=30,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=$o/rms.txt" -f null - 2>/dev/null || true
n=$(wc -l < $o/cuts.list | tr -d ' ')
echo "$v dur=$dur cuts=$n sheets=$(ls $o/sheet_*.jpg | wc -l | tr -d ' ')"
