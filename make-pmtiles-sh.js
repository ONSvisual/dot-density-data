import fs from "fs";

const zoom = 11;
const config_path = "./output/data/content.json";

const cmd = (key, zoom) => `tippecanoe -z${zoom} -o output/tiles/${key}-z${zoom}.pmtiles -P -pf -pk output/dots/${key}.json.gz`;

let datasets = JSON.parse(fs.readFileSync(config_path));
let commands = datasets.map(d => cmd(d.classCode, zoom));

fs.writeFileSync("./make-pmtiles.sh", commands.join("\n"));