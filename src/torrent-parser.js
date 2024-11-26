import fs from "fs";

import bencode from "bencode";

import crypto from "crypto";

import bignum from "bignum";

const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

const size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  return bignum.toBuffer(size, { size: 8 });
};

const infoHash = (torrent) => {
  const info = bencode.decode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};

export default { open, size, infoHash };


modeule.exports.BLOCK_LEN = Math.pow(2, 14);
modeule.exports.pieceLen = (torrent, pieceIndex) => {
  const totalLength = bignum.fromBuffer(size(torrent)).toNumber();
  const pieceLength = torrent.info["piece length"];
  const lastPieceLength = totalLength % pieceLength;
  const lastPieceIndex = Math.floor(totalLength / pieceLength);

  return lastPieceIndex === pieceIndex ? lastPieceIndex:pieceLength;
};

modeule.exports.blocksPerPiece = (torrent, pieceIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);
  return Math.ceil(pieceLength / BLOCK_LEN);
};

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);
  const lastPieceLength = pieceLength % this.BLOCK_LEN;
  const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);

  return blockIndex === lastPieceIndex ? lastPieceLength:this.BLOCK_LEN;
};