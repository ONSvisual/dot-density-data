import fs from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvParse, autoType } from "d3-dsv";
import { shuffle, getZooms, sleep } from "./js/utils.js";

const config_path =  "./output/data/content.json";
const dots = "./output/dots/oa21-dots.json.gz";

const datasets = JSON.parse(fs.readFileSync(config_path));

const MAX_OA = 1000;

function randomRound(exactDotCount, entitiesPerDot, prevExactDotCount, prevRoundedDotCount, prevEntitiesPerDot) {
  if (prevExactDotCount != null && prevExactDotCount < 1) {
    let partialDot = prevRoundedDotCount / entitiesPerDot * prevEntitiesPerDot;
    return Math.random() < partialDot ? 1 : 0;
  } else {
    let floor = Math.floor(exactDotCount);
    let remainder = exactDotCount - floor;
    return floor + (Math.random() < remainder ? 1 : 0);
  }
}

function calcDotCounts(entityCount, zooms) {
  let prevRoundedDotCount = null;
  let prevExactDotCount = null;
  let prevEntitiesPerDot = null;
  let dotCounts = [];
  for (let zoomLevel=zooms.length-1; zoomLevel>=0; zoomLevel--) {
    let entitiesPerDot = zooms[zoomLevel];
    let exactDotCount = entityCount / entitiesPerDot;
    let roundedDotCount = randomRound(
      exactDotCount, entitiesPerDot, prevExactDotCount, prevRoundedDotCount, prevEntitiesPerDot);
    dotCounts.push({zoomLevel, exactDotCount, roundedDotCount});
    prevExactDotCount = exactDotCount;
    prevRoundedDotCount = roundedDotCount;
    prevEntitiesPerDot = entitiesPerDot;
  }
  dotCounts.reverse();
  return dotCounts;
}

/*
 * Parameters:
 * oaCode    the code of the current output area
 * allPoints the input set of all points (perhaps more than we need)
 * cols      the names of the categories (array of strings)
 * codes     the corresponding codes of the categories (array of strings)
 * row       the row of data for this OA, including a count for each member of cols (Object)
 * output    the output filename
 */
function writeDots(oaCode, allPoints, cols, codes, row, output) {
  const zooms = getZooms();

  let dotsByZoomLevel = zooms.map(() => []);

  cols.forEach((c, i) => {
    let entityCount = row[c];
    let dotCounts = calcDotCounts(entityCount, zooms);
    let dotCountSoFar = 0;
    for (let dc of dotCounts) {
      for (let j=dotCountSoFar; j<dc.roundedDotCount; j++) {
        dotsByZoomLevel[dc.zoomLevel].push({zoomLevel: dc.zoomLevel, category: codes[i]});
      }
      dotCountSoFar = dc.roundedDotCount;
    }
  });
  
  zooms.forEach((z, i) => dotsByZoomLevel[i] = shuffle(dotsByZoomLevel[i]));

  const dots = dotsByZoomLevel.flat();

  if (dots.length > allPoints.length) throw "Not enough input points!";

  const points = allPoints.slice(0, dots.length);
  points.forEach((p, i) => {
    p.tippecanoe = {minzoom: dots[i].zoomLevel};
    p.properties = {cat: dots[i].category, oaCode};
  })

  fs.appendFileSync(output, `${points.map(d => JSON.stringify(d)).join('\n')}\n`);
  return points;
}

// Recursive function to run datasets in series (ie. synchronously)
function runDatasets(n = 0) {
  // FIXME: delete the following line
  if (n != 0) return;

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
    let points;

    // Create output file, and start reading dot geometry file line-by-line
    const output = `./output/dots/${classification}.json`;
    fs.writeFileSync(output, "");
    const lineReader = new readline(fs.createReadStream(dots).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      // FIXME: delete the following chunk of code
      if (rowCount > MAX_OA) {
        lineReader.close();
        return;
      }

      // Read features line-by-line
      let feature = JSON.parse(line);
      let code = feature.properties.oa;
      if (code !== current) {
        // When a new OA is reached, apply data and write dots for current OA to output file
        if (points) {
          lineReader.pause();
          let pointsWritten = writeDots(current, points, cols, codes, row, output);
          dotCount += pointsWritten.length;
          if (rowCount % 1000 === 0) console.log(`${classification}: ${dotCount} dots processed from ${rowCount} OAs...`);
          lineReader.resume();
        }
        current = code;
        row = lookup[code];
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