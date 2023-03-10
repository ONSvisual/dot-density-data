# Dot density scripts

This set of Node scripts is designed to generate vector tiles for a dot density visualisation of Census 2021 data for England and Wales. The vector tiles generated by this script are used to power [this dot density mapping demo](https://onsvisual.github.io/dot-density-demo/). The scripts can be adapted to work with geography files and datasets from other countrie

The scripts are optimised to generate dots (at a resolution of one dot per person) that are evenly spread and drop nicely at each zoom level when converted to vector tiles (.pmtiles format) with [Tippecanoe](https://github.com/felt/tippecanoe).

Input and output files for these scripts are in a GeoJSON-LD (line-delimited) format, which allows for line-by-line processing of files, massively reducing the RAM required to run this kind of operation. They should therefore be able to run fine on any desktop PC with the correct software installed, though they will take a while.

*Note: This repo also hosts the .pmtiles vector tile sets up to zoom level 11 and other auxilliary data files for testing purposes.*

## Getting started

To run all of the scripts in this repo, you will need to have Git, NodeJS and Tippecanoe installed on your machine. Note that Tippecanoe will only run on Linux or MacOS. On Windows you first need to enable WSL.

First, you need to clone the repo, using the following Git command:

```bash
git clone https://github.com/ONSvisual/dot-density-data.git
```

Next cd into the directory and install the Node dependencies:

```bash
cd dot-density-data
npm install
```

You now need to run the following command to merge the GeoJSON-LD input file (the file is split due to filesize limits on Github):

```bash
node join-files
```

If you want to run the scripts using other geography files or data you'll need to make your own modifications to the scripts. This shouldn't be too complicated a process if you have some working knowledge of NodeJS and GIS.

## Running the scripts

With the dependencies installed, you can run the scripts in the order below. Run the scripts from the command line like this (the .js extension is in the command optional):

```bash
node {script-name}
```

## make-config.js

Generates a config file that allows the other scripts to run (a copy of this file already exists in the repo at **/output/data/content.json**). If you are using your own datasets you'll need to edit the output file manually.

## join-files.js

As noted above, this script will merge the input files to form a single (gzipped) GeoJSON-LD file **/input/geo/oa21-bfc-clipped.json.gz** with the England and Wales census "output areas", clipped to coastlines and inland water. (The files are split to allow them to be hosted on Github).

## make-dots.js

Generates raw dots in GeoJSON-LD format given a set of boundaries (see above) and per-boundary population counts (also provided at **/input/lookup/oa21-population.csv**). It will generate a few more dots than the total population of each area, since population counts vary slightly between datasets. (Only the precise number of dots are used when applying the datasets in the next step.)

The dot placement algorithm useed is based on [this code](https://observablehq.com/@jtrim-ons/dot-density-map-a-tweaked-version) by James Trimble.

The order of the generated dots allows them to be dropped sequentially while maintaining an even spread of dots within a given boundary.

## make-dotsets.js

Applies categorical datasets to the dots generated by the above script. Input datasets are defined in **/output/data/content.json** and data files are in the **/input/data/** folder. The output is a GeoJSON-LD file per dataset with the dots and cateogories.

The generated dots also include a "minzoom" property that tells Tippecanoe a what zoom level to drop them. All dots are set to be visible at zoom level 14.

## make-pmtiles-sh.js

Generates the bash script below for running the Tippecanoe commands to turn the dots into a vector tileset in .pmtiles format. By default, the maximum zoom level is 11. If you want to increase this, just edit the line that says `const maxzoom = 11`. If you set this to 14, the output files will be at a resolution of one dot per person at that zoom level. (You can also adjust this script if you want an output format other than .pmtiles).

## make-pmtiles.sh

A bash script with a set of Tippecanoe commands for generating .pmtiles vector tiles from the dots generated by the above scripts. Run this as follows:

```bash
sh make-pmtiles.sh
```

## make-dirs-sh.js

In case you need static pbf vector tiles in a directory (eg. if you server/CDN does not support the byte-range reading necessary to serve .pmtiles files), this script generates a set of tile-join commands to unpack the .pmtiles files generated in the previous step.

## make-dirs.sh

A bash script with a set of tile-join commands to unpack .pmtiles files to .pbf vector tiles in a directory. Run this as follows:

```bash
sh make-dirs.sh
```

## make-quads.js

Generates auxilliary data files for overlaying percentage data on the map by area (LAD, MSOA and OA level). This data structure is specific to [this demo](https://onsvisual.github.io/dot-density-demo/), so may not be useful in other applications.