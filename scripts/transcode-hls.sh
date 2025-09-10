#!/usr/bin/env bash
# Usage: ./scripts/transcode-hls.sh input.mp4 out/demo
set -euo pipefail
IN=${1:?input mp4}; OUT=${2:?output folder}
mkdir -p "$OUT"
ffmpeg -y -i "$IN" \
-filter:v:0 "scale=w=1920:h=1080:force_original_aspect_ratio=decrease" -c:v:0 libx264 -preset veryfast -b:v:0 5000k -maxrate:v:0 5500k -bufsize:v:0 7500k \
-filter:v:1 "scale=w=1280:h=720:force_original_aspect_ratio=decrease" -c:v:1 libx264 -preset veryfast -b:v:1 3000k -maxrate:v:1 3300k -bufsize:v:1 4500k \
-filter:v:2 "scale=w=854:h=480:force_original_aspect_ratio=decrease" -c:v:2 libx264 -preset veryfast -b:v:2 1200k -maxrate:v:2 1320k -bufsize:v:2 1800k \
-map v:0 -map a:0? -map v:1 -map a:0? -map v:2 -map a:0? -c:a aac -b:a 128k -ac 2 \
-f hls -hls_time 4 -hls_playlist_type vod -hls_segment_type mpegts \
-hls_flags independent_segments \
-master_pl_name master.m3u8 \
-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
-hls_segment_filename "$OUT"/out_%v/seg_%06d.ts "$OUT"/out_%v/index.m3u8
ffmpeg -y -i "$IN" -vf "thumbnail,scale=640:-1" -frames:v 1 "$OUT"/poster.jpg
printf "
Done → %s
" "$OUT"