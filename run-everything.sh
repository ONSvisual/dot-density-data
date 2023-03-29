#!/bin/bash

set -euo pipefail

mkdir -p output/dots
mkdir -p output/dirs
mkdir -p output/dir-zips
mkdir -p python-test/results

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
chmod u+x make-pmtiles.sh
rm -f output/tiles/*
./make-pmtiles.sh
echo Running make-dirs-sh.js...
node make-dirs-sh
echo Running make-dirs.sh...
chmod u+x make-dirs.sh
./make-dirs.sh
echo Running make-quads.js...
node make-quads

echo Running check-dotcounts.py...
(cd python-test/ && python3 check-dotcounts.py | tee results/check-dotcounts-output.txt)
echo Running recompute-dotcounts.py...
(cd python-test/ && python3 recompute-dotcounts.py | tee results/recompute-dotcounts-output.txt)

echo Done.
echo To do manually: check python-test results.
