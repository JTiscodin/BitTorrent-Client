import fs from "fs";

import bencode from "bencode";

import { Buffer } from "buffer";

import { getPeers } from "./src/tracker";

// import torrentParser from "./src/torrent-parser"

// const torrent = torrentParser.open("./gtav.torrent")
// added for download - Shubh
const download = require('./src/downlaod');
const torrentParser = require('./src/torrent-parser');
const torrent = torrentParser.open(process.argv[2]);

getPeers(torrent, peers => {
    console.log("list of peers", peers)
})

download(torrent);