import genDots from "./js/gen-dots.js";
import fs from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvParse, autoType } from "d3-dsv";
import { sleep } from "./js/utils.js";

const geometry = "./input/geo/oa21-bfc-clipped.json.gz";
const population = "./input/lookup/oa21-population.csv";
const output = "./output/dots/oa21-dots.json";

// Load population counts per OA
let pop = csvParse(fs.readFileSync(population, {encoding:'utf8', flag:'r'}), autoType);
let lookup = {};
pop.forEach(p => lookup[p.areacd] = p.pop);

// Create output file + start reading OA boundaries
fs.writeFileSync(output, "");
const lineReader = new readline(fs.createReadStream(geometry).pipe(zlib.createGunzip()));

let n = 0;
lineReader.on('line', (line) => {
  // Generate dots for each OA (in JSON-LD each line is one OA)
  lineReader.pause();
  let feature = JSON.parse(line);
  // Generate 30 extra dots to account for perturbation in datasets
  let dots = genDots(feature, lookup[feature.properties.OA21CD] + 30);
  fs.appendFileSync(output, `${dots.map(d => JSON.stringify(d)).join('\n')}\n`);
  if (n % 1000 === 0) console.log(`${n} OAs processed...`);
  n ++;
  lineReader.resume();
});

lineReader.on("end", async () => {
  // Gzip file
  await sleep();
  const gzip = zlib.createGzip();
  const inp = fs.createReadStream(output);
  const out = fs.createWriteStream(`${output}.gz`);
  inp.pipe(gzip).pipe(out);
  out.on("finish", () => {
    fs.unlink(output, () => console.log(`Finished zipping ${output}.gz`));
  });
});