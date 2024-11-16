import fs from "fs";

import bencode from "bencode";

import { Buffer } from "buffer";

import { getPeers } from "./tracker";

const torrent = bencode.decode(fs.readFileSync("gtav.torrent"));

getPeers(torrent, peers => {
    console.log("list of peers", peers)
})

