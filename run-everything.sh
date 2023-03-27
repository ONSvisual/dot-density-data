#!/bin/bash

set -euo pipefail

mkdir -p output/dots
mkdir -p output/dirs
mkdir -p output/dir-zips

npm install

echo Running make-config.js...
node make-config
echo Running join-files.js...
node join-files
echo Running make-dots.js...
node make-dots
echo Running make-dotsets.js...
node make-dotsets
echo Running make-pmtiles-sh.js...
node make-pmtiles-sh
echo Running make-pmtiles.sh...
./make-pmtiles.sh
echo Running make-dirs-sh.js...
node make-dirs-sh
echo Running make-dirs.sh...
./make-dirs.sh
echo Running make-quads.js...
node make-quads

echo Done.
