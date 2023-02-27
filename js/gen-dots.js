import * as turf from "@turf/turf";
import { geoMercator } from "d3-geo";

const effort = 3;
const edgeSpacing = 3;
const projection = geoMercator();

function roundCoords(coords) {
  return [Math.round(coords[0] * 1e6) / 1e6, Math.round(coords[1] * 1e6) / 1e6];
}

function randomPointInPolygon(polygon, bbox) {
  let point;
  do {
    point = turf.randomPoint(1, { bbox: bbox }).features[0];
  } while (!turf.booleanPointInPolygon(point.geometry.coordinates, polygon));
  return point;
}

function getProjectedSegments(polygon) {
  return turf
    .lineSegment(polygon)
    .features.map((f) => f.geometry.coordinates.map(projection));
}

function pointToLineDistance(p, [v, w]) {
  function dist2(v, w) {
    let dx = v[0] - w[0];
    let dy = v[1] - w[1];
    return dx * dx + dy * dy;
  }
  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t =
      ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
  }
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

function distanceToNearestSegment(point, segments) {
  let nearest = Infinity;
  for (let segment of segments) {
    // Do a few quick checks to try to avoid an expensive pointToLineDistance() call
    if (point[0] >= segment.xmax + nearest) continue;
    if (point[1] >= segment.ymax + nearest) continue;
    if (point[0] <= segment.xmin - nearest) continue;
    if (point[1] <= segment.ymin - nearest) continue;
    let d = pointToLineDistance(point, segment.coords) * edgeSpacing;
    if (d < nearest) nearest = d;
  }
  return nearest;
}

function updateDistances(points, point) {
  for (let p of points) {
    let dx = point[0] - p.p[0];
    let dy = point[1] - p.p[1];
    if (Math.abs(dx) >= p.d || Math.abs(dy) >= p.d) continue; // a little optimisation
    let d = Math.hypot(dx, dy);
    if (d < p.d) p.d = d;
  }
}

function projectPoint(point) {
  return projection(point.geometry.coordinates);
}

function indexOfBest(points) {
  let bestIndex = 0;
  let bestDist = points[0].d;
  for (let i = 1; i < points.length; i++) {
    if (points[i].d > bestDist) {
      bestDist = points[i].d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

export default function(polygon, pop, peoplePerDot = 1) {
  let points = [];
  let bbox = turf.bbox(polygon);
  let lineSegments = getProjectedSegments(polygon).map(
    ([[x0, y0], [x1, y1]]) => ({
      coords: [
        [x0, y0],
        [x1, y1]
      ],
      xmin: Math.min(x0, x1),
      xmax: Math.max(x0, x1),
      ymin: Math.min(y0, y1),
      ymax: Math.max(y0, y1)
    })
  );
  let count = Math.round(pop / peoplePerDot);
  let randomPoints = [];
  for (let i = 0, end = count * effort * 2; i < end; i++) {
    let unprojectedP = randomPointInPolygon(polygon, bbox);
    unprojectedP.geometry.coordinates = roundCoords(unprojectedP.geometry.coordinates);
    let p = projectPoint(unprojectedP);
    randomPoints.push({
      unprojectedP,
      p,
      d: distanceToNearestSegment(p, lineSegments)
    });
  }
  let i = 1;
  while (i <= count) {
    let bestIndex = indexOfBest(randomPoints);
    let point = randomPoints[bestIndex];

    // remove point from randomPoints
    randomPoints[bestIndex] = randomPoints[randomPoints.length - 1];
    randomPoints.pop();

    updateDistances(randomPoints, point.p);

    point.unprojectedP.properties.oa =
      polygon.properties.OA21CD;
    points.push(point.unprojectedP);
    i++;
  }
  return points;
}