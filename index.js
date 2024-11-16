import fs from "fs";

import bencode from "bencode";

import { Buffer } from "buffer";

import { getPeers } from "./src/tracker";

import torrentParser from "./src/torrent-parser"

const torrent = torrentParser.open("./gtav.torrent")

getPeers(torrent, peers => {
    console.log("list of peers", peers)
})

