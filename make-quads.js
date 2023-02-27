import fs from "fs";
import zlib from "zlib";
import { csvParse, autoType, csvFormat } from "d3-dsv";

const config_path = "./output/data/content.json";
const lookup_path = (key) => `./input/geo/${key}21-lookup.csv`;
const output_path = (key, quad) => `./output/data/${key}/${quad}`;
const keys = ["lad", "msoa", "oa"];

let lookups = {};

async function makeData(variables, n = 0) {
  let variable = variables[n];
  if (!variable) {
    return;
  };
  console.log(`Generating data quads for ${variable.varCode}...`);
  let cats = variable.categories;
  zlib.gunzip(fs.readFileSync(variable.filePath), (err, raw) => {
    let csv = raw.toString();
    let data_raw = csvParse(csv, autoType);
    let names = cats.map(c => c.code);
    let cols = cats.map(c => c.nameOld ? `Percentage: ${c.nameOld}` : `Percentage: ${c.name}`);
    let data_lookup = {};
    data_raw.forEach(d => {
      let row = {areacd: d["Geography code"]};
      names.forEach((name, i) => row[name] = d[cols[i]]);
      data_lookup[row.areacd] = row;
    });
    keys.forEach(key => {
      let quads = Object.keys(lookups[key]);
      quads.forEach(quad => {
        let rows = lookups[key][quad].map(code => data_lookup[code]);
        let csv = csvFormat(rows);
        let path = output_path(key, quad.replaceAll("_","-"));
        if (!fs.existsSync(`./output/data/${key}`)){
          fs.mkdirSync(`./output/data/${key}`);
        }
        if (!fs.existsSync(path)){
          fs.mkdirSync(path);
        }
        fs.writeFileSync(`${path}/${variable.classCode}.csv`, csv);
      });
    });
    makeData(variables, n + 1);
  });
};

let vars = JSON.parse(fs.readFileSync(config_path));

for (let i = 0; i < keys.length; i ++) {
  let key = keys[i];
  let data_raw = fs.readFileSync(lookup_path(key)).toString();
  let data = csvParse(data_raw);
  let lkp = {};
  data.forEach(d => {
    if (!lkp[d.quad]) lkp[d.quad] = [];
    lkp[d.quad].push(d.areacd);
  });
  lookups[key] = lkp;
}
makeData(vars);