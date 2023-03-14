const zooms = [
  50000, 20000, 10000,
  5000, 2000, 1000,
  500, 200, 100,
  50, 20, 10,
  5, 2, 1
];

export function getZooms() {
  return zooms;
}

export function shuffle(array) {
	return array
	.map(value => ({ value, sort: Math.random() }))
	.sort((a, b) => a.sort - b.sort)
	.map(({ value }) => value);
}

export function sleep(ms = 5000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}