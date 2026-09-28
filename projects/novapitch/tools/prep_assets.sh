#!/bin/sh
# Copies the client's demo assets (the Nova Pitch showroom's fictional Luminex Labs deck, company mark and
# founder avatar) from a local checkout of the product repo. They are not in this repo.
#   RELATEFY=~/Documents/unloadex/relatefy sh projects/novapitch/tools/prep_assets.sh
set -e
SRC="${RELATEFY:-$HOME/Documents/unloadex/relatefy}/frontend/public/demo"
DST="$(cd "$(dirname "$0")/.." && pwd)/assets"
mkdir -p "$DST/slides" "$DST/brand"
pdftoppm -png -scale-to-x 2560 -scale-to-y 1440 "$SRC/luminex-grid-intelligence.pdf" "$DST/slides/s"
cp "$SRC/luminex-mark.svg" "$SRC/maya-chen.svg" "$DST/brand/"
echo "slides + brand → $DST"
