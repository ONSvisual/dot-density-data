import split from 'split-file';

const output = "./input/geo/oa21-bfc-clipped.json.gz";
const input = (i) => `${output}.sf-part${i}`;

split.mergeFiles([1, 2, 3, 4, 5].map(i => input(i)), output)
.then(() => {
  console.log(`Merged ${output}`);
})
.catch((err) => {
  console.log('Error: ', err);
});