import fs from "fs";

const pmtiles_path = "./output/tiles/";
const cmd = (key, file) => 
    `tile-join -e output/dirs/${key} -pk output/tiles/${file}\n` +
        `(cd output/dirs/${key} && zip -r "../../dir-zips/${key}.zip" .)`;

let datasets = [];

// Find the .pmtiles files in the output directory
fs.readdirSync(pmtiles_path)
  .filter(file => file.slice(-8) === ".pmtiles")
  .forEach(file => {
    let key = file.slice(0, -8).split("-z")[0];
    datasets.push({key, file});
});

let commands = datasets.map(d => cmd(d.key, d.file));

fs.writeFileSync("./make-dirs.sh", commands.join("\n"));