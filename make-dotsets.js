import fs from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvParse, autoType } from "d3-dsv";
import { shuffle, getZoomBreaks, getMinzoom, sleep } from "./js/utils.js";

const config_path =  "./output/data/content.json";
const dots = "./output/dots/oa21-dots.json.gz";

const datasets = JSON.parse(fs.readFileSync(config_path));

const MAX_OA = 100;

function writeDots(points, count, cols, codes, row, output) {
  points = points.slice(0, count);
  const len = points.length;
  if (len != count) throw "Not enough dots!";
  const cats = (() => {
    // Category index for each dot
    // Shuffled to ensure random layout + even dropping by zoom level
    let cts = [];
    cols.forEach((c, i) => {
      for (let j = 0; j < row[c]; j ++) {
        cts.push(i);
      }
    });
    return shuffle(cts);
  })();
  const zoomBreaks = getZoomBreaks(len);
  points.forEach((p, i) => {
    p.tippecanoe = {minzoom: getMinzoom(zoomBreaks, i)};
    p.properties = {cat: codes[cats[i]]};
  });
  fs.appendFileSync(output, `${points.map(d => JSON.stringify(d)).join('\n')}\n`);
}

// Recursive function to run datasets in series (ie. synchronously)
function runDatasets(n = 0) {
  if (n >= datasets.length) return;
  let dataset = datasets[n];
  let path = dataset.filePath;
  zlib.gunzip(fs.readFileSync(path), (err, raw) => {
    let data = csvParse(raw.toString(), autoType);
    let classification = dataset.classCode;
    let cats = dataset.categories;
    let cols = cats.map(c => c.nameOld ? c.nameOld : c.name);
    let codes = cats.map(c => c.code);
    let lookup = {};
    data.forEach(d => lookup[d["Geography code"]] = d);

    // Keep track of progress
    let rowCount = 0;
    let dotCount = 0;

    // Data for current OA
    let current;
    let row;
    let count;
    let points;

    // Create output file, and start reading dot geometry file line-by-line
    const output = `./output/dots/${classification}.json`;
    fs.writeFileSync(output, "");
    const lineReader = new readline(fs.createReadStream(dots).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      // Read features line-by-line
      let feature = JSON.parse(line);
      let code = feature.properties.oa;
      if (code !== current) {
        // When a new OA is reached, apply data and write dots for current OA to output file
        if (points) {
          lineReader.pause();
          writeDots(points, count, cols, codes, row, output);
          dotCount += count;
          if (rowCount % 1000 === 0) console.log(`${classification}: ${dotCount} dots processed from ${rowCount} OAs...`);
          lineReader.resume();
        }
        current = code;
        row = lookup[code];
        count = cols.map(c => row[c]).reduce((a, b) => a + b, 0);
        points = [];
        rowCount ++;
      }
      points.push(feature);
    });
    lineReader.on("end", async () => {
      // Gzip completed dataset
      await sleep();
      const gzip = zlib.createGzip();
      const inp = fs.createReadStream(output);
      const out = fs.createWriteStream(`${output}.gz`);
      inp.pipe(gzip).pipe(out);
      out.on("finish", () => {
        fs.unlink(output, () => {
          console.log(`Finished zipping ${output}.gz`);

          // Start next dataset
          runDatasets(n + 1);
        });
      });
    });
  });
}

// Call the function to start processing the datasets
runDatasets();