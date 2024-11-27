'use strict';

const fs = require('fs');
const bencode = require('bncode'); // Updated package
const crypto = require('crypto');

module.exports.BLOCK_LEN = 2 ** 14;

module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

module.exports.infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

module.exports.size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b, 0)
    : torrent.info.length;

  return BigInt(size);
};

module.exports.pieceLen = (torrent, pieceIndex) => {
  const totalLength = module.exports.size(torrent);
  const pieceLength = BigInt(torrent.info['piece length']);

  const lastPieceLength = totalLength % pieceLength;
  const lastPieceIndex = totalLength / pieceLength;

  return pieceIndex === Number(lastPieceIndex) ? lastPieceLength : pieceLength;
};

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
  const pieceLength = module.exports.pieceLen(torrent, pieceIndex);
  return Math.ceil(Number(pieceLength) / module.exports.BLOCK_LEN);
};

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = module.exports.pieceLen(torrent, pieceIndex);
  const blockLength = BigInt(module.exports.BLOCK_LEN);

  const lastBlockLength = pieceLength % blockLength;
  const lastBlockIndex = pieceLength / blockLength;

  return blockIndex === Number(lastBlockIndex) ? Number(lastBlockLength) : module.exports.BLOCK_LEN;
};