export default class ModDotColourer {
  currentDotIndex = 0;    // incremented each time we colour a new dot

  getMinZoom(index, zooms) {
		for (let i = 0; i < zooms.length; i ++) {
			if (
				(index % zooms[i] === 0) &&
				!(zooms[i - 1] / zooms[i] === 2.5 && index % zooms[i - 1] === zooms[i + 1])
			) return i;
		}
		return 14;
	}

  makeDotsByZoomLevel(zooms, cols, codes, row) {
    let dotsByZoomLevel = zooms.map(() => []);

    cols.forEach((c, i) => {
      for (let j = 0; j < row[c]; j++) {
        let minZoom = this.getMinZoom(this.currentDotIndex, zooms);
        this.currentDotIndex++;
        dotsByZoomLevel[minZoom].push({zoomLevel: minZoom, category: codes[i]});
      }
    });

    return dotsByZoomLevel;
  }
}