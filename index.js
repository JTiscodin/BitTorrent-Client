'use strict';

// const { Command } = require('commander');
import { Command } from 'commander';
import download from './src/download.js';
import torrentParser from './src/torrent-parser.js';
// const download = require('./src/download');
// const torrentParser = require('./src/torrent-parser');

const program = new Command();
program
  .version('1.0.0')
  .description('Torrent downloader')
  .argument('<torrent>', 'Path to the torrent file')
  .option('-d, --directory <path>', 'Directory to save downloaded files', './downloads')
  .action((torrent, options) => {
    const parsedTorrent = torrentParser.open(torrent);
    download(parsedTorrent, options.directory);
  });

program.parse(process.argv);