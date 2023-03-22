import fs from "fs";
import zlib from "zlib";
import { csvParse, autoType, csvFormat } from "d3-dsv";

const config_path = "./output/data/content.json";
const output_path = "./output/data";
const lookup_path = (key) => `./input/lookup/${key}21-lookup.csv`;
const quads_path = (key, quad) => `${output_path}/tiles/${key}/${quad}`;
const breaks_path = `${output_path}/ew`;
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
      let row = {geography_code: d["Geography code"]};
      names.forEach((name, i) => row[name] = d[cols[i]]);
      data_lookup[row.geography_code] = row;
    });
    keys.forEach(key => {
      let quads = Object.keys(lookups[key]);
      quads.forEach(quad => {
        let rows = lookups[key][quad].map(code => data_lookup[code]);
        let csv = csvFormat(rows);
        let path = quads_path(key, quad.replaceAll("_","-"));
        if (!fs.existsSync(`./output/data/tiles/${key}`)){
          fs.mkdirSync(`./output/data/tiles/${key}`);
        }
        if (!fs.existsSync(path)){
          fs.mkdirSync(path);
        }
        fs.writeFileSync(`${path}/${variable.classCode}.csv`, csv);
      });
    });
    const ew = data_lookup["K04000001"];
    let vals = {};
    names.forEach((name) => vals[name] = ew[name]);
    fs.writeFileSync(`${breaks_path}/${variable.classCode}.json`, JSON.stringify(vals));
    
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