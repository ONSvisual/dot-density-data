"""This is a simple script to calculate the dot counts at each zoom
level using Ahmad's dot-colouring algorithm.  It works slightly differently
from the JS code, but should give the same numbers as check-dotcounts.py;
otherwise, something has gone wrong.
"""

import csv
import gzip
import json

import os
outpath = 'results'
os.makedirs(outpath, exist_ok=True)

ZOOMS = [
  50000, 20000, 10000,
  5000, 2000, 1000,
  500, 200, 100,
  50, 20, 10,
  5, 2, 1
]

def make_dot_zooms(dots):
  dot_zooms = [-1] * len(dots)
  for zoom_level, people_per_dot in enumerate(ZOOMS):
    for i in range(0, len(dots), people_per_dot):
      if dot_zooms[i] != -1: continue
      if (
        people_per_dot in [2, 20, 200, 2000, 20000] and
        i % (people_per_dot * 5) == people_per_dot * 3
      ):
        continue
      dot_zooms[i] = zoom_level
  return dot_zooms

with open("../output/data/content.json", "r") as f:
  content = json.load(f)

for dataset in content:
  dots = []     # One dot per person, to check against a simple implementation of Ahmad's algorithm

  csv_gz_filename = f'../{dataset["filePath"]}'
  categories = [
    {
      "code": category["code"],
      "name": category["nameOld"] if "nameOld" in category else category["name"]
    }
    for category in dataset["categories"]
  ]

  with gzip.open(csv_gz_filename, "rt") as csvfile:
    csvreader = csv.DictReader(csvfile)
    for line in csvreader:
      if line['Geography area type'] != 'Output Area':
        continue
      for cat_index, category in enumerate(categories):
        for i in range(int(line[category["name"]])):
          dots.append(cat_index)

  print(f"Finished reading {csv_gz_filename}")

  dot_zooms = make_dot_zooms(dots)
 
  for cat_index, category in enumerate(categories):
    print(f'# {category["name"]}')
    for i, zoom in enumerate(ZOOMS):
      print(f'Zoom {i}: Recomputed dot count:   {sum(1 for dot, dot_zoom in zip(dots, dot_zooms) if dot_zoom <= i and dot == cat_index)}')