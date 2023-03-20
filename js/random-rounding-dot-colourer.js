export default class RandomRoundingDotColourer {
  randomRound(exactDotCount, entitiesPerDot, prevExactDotCount, prevRoundedDotCount, prevEntitiesPerDot) {
    if (prevExactDotCount != null && prevExactDotCount < 1) {
      let partialDot = prevRoundedDotCount / entitiesPerDot * prevEntitiesPerDot;
      return Math.random() < partialDot ? 1 : 0;
    } else {
      let floor = Math.floor(exactDotCount);
      let remainder = exactDotCount - floor;
      return floor + (Math.random() < remainder ? 1 : 0);
    }
  }

  calcDotCounts(entityCount, zooms) {
    let prevRoundedDotCount = null;
    let prevExactDotCount = null;
    let prevEntitiesPerDot = null;
    let dotCounts = [];
    for (let zoomLevel=zooms.length-1; zoomLevel>=0; zoomLevel--) {
      let entitiesPerDot = zooms[zoomLevel];
      let exactDotCount = entityCount / entitiesPerDot;
      let roundedDotCount = this.randomRound(
        exactDotCount, entitiesPerDot, prevExactDotCount, prevRoundedDotCount, prevEntitiesPerDot);
      dotCounts.push({zoomLevel, exactDotCount, roundedDotCount});
      prevExactDotCount = exactDotCount;
      prevRoundedDotCount = roundedDotCount;
      prevEntitiesPerDot = entitiesPerDot;
    }
    dotCounts.reverse();
    return dotCounts;
  }

  makeDotsByZoomLevel(zooms, cols, codes, row) {
    let dotsByZoomLevel = zooms.map(() => []);

    cols.forEach((c, i) => {
      let entityCount = row[c];
      let dotCounts = this.calcDotCounts(entityCount, zooms);
      let dotCountSoFar = 0;
      for (let dc of dotCounts) {
        for (let j=dotCountSoFar; j<dc.roundedDotCount; j++) {
          dotsByZoomLevel[dc.zoomLevel].push({zoomLevel: dc.zoomLevel, category: codes[i]});
        }
        dotCountSoFar = dc.roundedDotCount;
      }
    });

    return dotsByZoomLevel;
  }
}
