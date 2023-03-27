#!/bin/bash

set -euo pipefail

mkdir -p output/dots
mkdir -p output/dirs
mkdir -p output/dir-zips

npm install

node make-config
node join-files
node make-dots
node make-dotsets
node make-pmtiles-sh
./make-pmtiles.sh
node make-dirs-sh
./make-dirs.sh
./make-quads