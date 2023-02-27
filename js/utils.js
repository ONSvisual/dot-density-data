export function shuffle(array) {
	return array
	.map(value => ({ value, sort: Math.random() }))
	.sort((a, b) => a.sort - b.sort)
	.map(({ value }) => value);
}

export function getZoomBreaks(len) {
  // Breaks for setting tippecanoe minzoom on each dot
  const zooms = [
    50000, 20000, 10000,
    5000, 2000, 1000,
    500, 200, 100,
    50, 20, 10,
    5, 2, 1
  ];
  let breaks = [];
  for (let i = 0; i < 14; i ++) {
    let brk = len / zooms[i];
    let flr = Math.floor(brk);
    brk = Math.random() < brk - flr ? flr + 1 : flr;
    breaks.push(brk);
  }
  return breaks;
}

export function getMinzoom(breaks, i) {
  for (let j = 0; j < breaks.length; j ++) {
    if (i < breaks[j]) return j;
  }
  return 14;
}

export function sleep(ms = 5000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}