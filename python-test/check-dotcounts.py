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

with open("../output/data/content.json", "r") as f:
  content = json.load(f)

for dataset in content[:1]:
  results = {}

  csv_gz_filename = f'../{dataset["filePath"]}'
  dots_gz_filename = f'../output/dots/{dataset["classCode"]}.json.gz'
  categories = dataset["categories"]

  with gzip.open(csv_gz_filename, "rt") as csvfile:
    csvreader = csv.DictReader(csvfile)
    for line in csvreader:
      results[line["Geography code"]] = {
        "oa": line["Geography code"]
      }
      for category in categories:
        for i, zoom in enumerate(ZOOMS):
          results[line["Geography code"]][category["code"] + "_exact_" + str(i)] = float(line[category["name"]]) / zoom

  print(f"Finished reading {csv_gz_filename}")
  oa_code = None
  with gzip.open(dots_gz_filename, "rt") as dotsfile:
    for line in dotsfile:
      line = json.loads(line)
      if oa_code != line["properties"]["oaCode"]:
        if oa_code != None:
          #print(oa_dots)
          for category in categories:
            for i, zoom in enumerate(ZOOMS):
              results[oa_code][category["code"] + "_dots_" + str(i)] = oa_dots[category["code"]][i]
          #print(results[oa_code])
        oa_code = line["properties"]["oaCode"]
        oa_dots = {c["code"]: [0] * len(ZOOMS) for c in categories}
      for zoom in range(line["tippecanoe"]["minzoom"], len(ZOOMS)):
        oa_dots[line["properties"]["cat"]][zoom] += 1

  results_subset = [r for r in results.values() if categories[0]["code"] + "_dots_0" in r]

  #print(results_subset)

  with open(f'{outpath}/{dataset["classCode"]}.csv', 'w', newline='') as csv_out_file:
    fieldnames = results_subset[0].keys()
    csvwriter = csv.DictWriter(csv_out_file, fieldnames=fieldnames)
    csvwriter.writeheader()
    for r in results_subset:
      csvwriter.writerow(r)

