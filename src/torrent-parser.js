'use strict';

import fs from 'fs';
import bencode from 'bncode';
import crypto from 'crypto';

export const BLOCK_LEN = 2 ** 14;

export const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

export const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

export const size = (torrent) => {
  const totalSize = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b, 0)
    : torrent.info.length;

  return BigInt(totalSize);
};

export const pieceLen = (torrent, pieceIndex) => {
  const totalLength = size(torrent);
  const pieceLength = BigInt(torrent.info['piece length']);

  const lastPieceLength = totalLength % pieceLength;
  const lastPieceIndex = totalLength / pieceLength;

  return pieceIndex === Number(lastPieceIndex) ? lastPieceLength : pieceLength;
};

export const blocksPerPiece = (torrent, pieceIndex) => {
  const pieceLength = pieceLen(torrent, pieceIndex);
  return Math.ceil(Number(pieceLength) / BLOCK_LEN);
};

export const blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = pieceLen(torrent, pieceIndex);
  const blockLength = BigInt(BLOCK_LEN);

  const lastBlockLength = pieceLength % blockLength;
  const lastBlockIndex = pieceLength / blockLength;

  return blockIndex === Number(lastBlockIndex) ? Number(lastBlockLength) : BLOCK_LEN;
};

export const getFiles = (torrent) => {
  if (torrent.info.files) {
    // Multi-file torrent
    let offset = BigInt(0);
    return torrent.info.files.map(file => {
      const fileInfo = {
        path: file.path.map(p => p.toString('utf8')).join('/'),
        length: BigInt(file.length),
        start: offset,
        end: offset + BigInt(file.length)
      };
      offset += BigInt(file.length);
      return fileInfo;
    });
  } else {
    // Single file torrent
    return [{
      path: torrent.info.name.toString('utf8'),
      length: BigInt(torrent.info.length),
      start: BigInt(0),
      end: BigInt(torrent.info.length)
    }];
  }
};

export default {getFiles, blockLen, pieceLen, size, infoHash, open, blocksPerPiece};