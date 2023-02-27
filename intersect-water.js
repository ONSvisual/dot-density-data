import fs from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import * as turf from "@turf/turf";

// 1. Get all OAs within a grid square (if their codes don't exist in object). Fix its geometry and add it to array. 
// 2. If one or more, get their shared bounding box. 
// 3. Get all water bodies intersecting with bounding box. Fix their geometry and add to array.
// 4. Cycle through the OAs. Get the water intersecting their bounding box. 
// 5. Intersect OA with filtered feature.
// 6. Write intersected OA to geojson file, and add its code to index object.
// 7. Do next grid square.
// 8. When finished, gzip geojson.

const input_geom = "./input/oa21-bfc-ld.json.gz";
const input_water = "./input/os-inland-water-ld.json.gz";
const output = "./input/oa21-clipped-ld.json";

const ew = [-6.418667, 49.864668, 1.763706, 55.811088];
const xdist = (ew[2] - ew[0]) / 10;
const ydist = (ew[3] - ew[1]) / 10;

let oa_codes = new Set();
let oa_polys = [];
let water_polys = [];

async function process(n = 0) {
  if (n >= 100) {
    const gzip = zlib.createGzip();
    const inp = fs.createReadStream(output);
    const out = fs.createWriteStream(`${output}.gz`);
    inp.pipe(gzip).pipe(out);
    out.on("finish", () => {
      fs.unlink(output, () => console.log(`Finished zipping ${output}.gz`));
    });
    return;
  }
  oa_polys = [];
  water_polys = [];
  let x = n % 10;
  let y = Math.floor(n / 10);
  let bbox = [
    ew[0] + (x * xdist),
    ew[1] + (y * ydist),
    ew[0] + ((x + 1) * xdist),
    ew[1] + ((y + 1) * ydist)
  ];
  console.log("x", x, "y", y, bbox);
  let bbox_poly = turf.bboxPolygon(bbox);
  const oa_reader = new readline(fs.createReadStream(input_geom).pipe(zlib.createGunzip()));

  oa_reader.on("line", (line) => {
    let feature = JSON.parse(line);
    let code = feature.properties.OA21CD;
    if (!oa_codes.has(code)) {
      let bbox_oa = turf.bbox(feature);
      let bbox_oa_poly = turf.bboxPolygon(bbox_oa);
      if (turf.booleanIntersects(bbox_oa_poly, bbox_poly)) {
        oa_polys.push(feature);
        oa_codes.add(code);
      }
    }
  });
  
  oa_reader.on("end", () => {
    console.log(`${oa_codes.size} total OAs read...`);
    if (!oa_polys[0]) {
      process(n + 1);
    } else {
      let bbox_oas = turf.bbox({type: "FeatureCollection", features: oa_polys});
      let bbox_oas_poly = turf.bboxPolygon(bbox_oas);
      const water_reader = new readline(fs.createReadStream(input_water).pipe(zlib.createGunzip()));

      water_reader.on("line", (line) => {
        let feature = JSON.parse(line);
        let bbox_water = turf.bbox(feature);
        let bbox_water_poly = turf.bboxPolygon(bbox_water);
        if (turf.booleanIntersects(bbox_water_poly, bbox_oas_poly)) {
          water_polys.push(feature);
        }
      });

      water_reader.on("end", () => {
        console.log(`Intersecting ${oa_polys.length} OAs with ${water_polys.length} water bodies...`);
        oa_polys.forEach(oa_poly => {
          let water = water_polys.filter(p => turf.booleanIntersects(
            turf.bboxPolygon(turf.bbox(p)),
            oa_poly));
          let feature;
          if (water[0]) {
            feature = turf.difference(oa_poly, ...water);
          } else {
            feature = oa_poly;
          }
          fs.appendFileSync(output, JSON.stringify(feature) + "\n");
        });
        process(n + 1);
      });
    }
  });
}

fs.writeFileSync(output, "");
process();