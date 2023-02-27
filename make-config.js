import datasets from "./config/datasets-all.js";
import maps from "./config/category-maps.js";
import extra from "./config/content-extra.js";
import fetch from "node-fetch";
import fs from "fs";

const content_url = "https://www.ons.gov.uk/visualisations/censusmapsmasterconfig/2021-MASTER.json";
const output_path = "./output/data";

function getMeta(json, d) {
  let classCode = d.slice(6);
  let num = classCode.split("").find(i => typeof +i === "number" && !Number.isNaN(+i));
  let varCode = num ? classCode.slice(0, classCode.indexOf(num) - 1) : classCode;
  let m = {varCode, classCode};
  json.content.forEach((theme) => {
    theme.variables.forEach((variable) => {
      if (variable.code === varCode || varCode.startsWith(variable.code)) {
        m.filePath = `./input/data/${d}_2021.csv.gz`;
        m.varName = variable.name;
        m.baseUrl = variable.base_url_2021;
        m.categories = [];
        variable.classifications.forEach(classification => {
          if (classification.code === classCode) {
            classification.categories.forEach(cat => {
              let category = {code: cat.code, name: cat.name};
              if (cat.code in maps) category.nameOld = maps[cat.code];
              m.categories.push(category);
            });
          }
        });
      }
    });
  });
  return m;
}

async function getVars() {
  let json = await (await fetch(content_url)).json();
  let meta = [];
  datasets.forEach(d => {
    let m = getMeta(json, d);
    if (m.categories) meta.push(m);
  });
  return meta;
}

getVars().then((vars) => {
  let vars_extended = [...vars, ...extra];
  if (!fs.existsSync(output_path)){
    fs.mkdirSync(output_path);
  }
  fs.writeFileSync(`${output_path}/content.json`, JSON.stringify(vars_extended));
});