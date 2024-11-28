import fs from 'fs';
import net from 'net';
import tracker from './tracker.js';
import message from './message.js';
import Pieces from './Pieces.js';
import Queue from './Queue.js';
import path from 'path';
import torrentParser from './torrent-parser.js';
import ora from 'ora';

// Export your module
export default (torrent, downloadPath) => {
  tracker.getPeers(torrent, peers => {
    const pieces = new Pieces(torrent);

    const files = torrentParser.getFiles(torrent);
    files.forEach(file => {
      const fullPath = path.join(downloadPath, file.path);
      try {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      } catch (err) {
        console.error(`Error creating directory for ${fullPath}: ${err.message}`);
      }
    });

    const fileHandles = files.map(file => {
      try {
        return fs.openSync(path.join(downloadPath, file.path), 'w');
      } catch (err) {
        console.error(`Error opening file ${file.path}: ${err.message}`);
        return null;
      }
    }).filter(handle => handle !== null);

    // Start the spinner using ora
    const spinner = ora('Connecting to peers...').start();

    peers.forEach(peer => {
      download(peer, torrent, pieces, fileHandles, files);
      spinner.text = `Downloading from ${peer.ip}:${peer.port}...`;
    });

    // Stop the spinner after connecting to peers
    spinner.succeed('Connected to peers');
  });
};

function download(peer, torrent, pieces, fileHandles, files) {
  const socket = new net.Socket();
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write(message.buildHandshake(torrent));
  });
  const queue = new Queue(torrent);
  onWholeMsg(socket, msg => msgHandler(msg, socket, pieces, queue, torrent, fileHandles, files));
}

function onWholeMsg(socket, callback) {
  let buffer = Buffer.alloc(0);
  socket.on('data', data => {
    buffer = Buffer.concat([buffer, data]);
    while (buffer.length > 4) {
      const length = buffer.readUInt32BE(0);
      if (buffer.length < length + 4) break;
      const msg = buffer.slice(4, length + 4);
      buffer = buffer.slice(length + 4);
      callback(msg);
    }
  });
}

function msgHandler(msg, socket, pieces, queue, torrent, fileHandles, files) {
  // Handle incoming messages from the peer
  // This function will process the messages and call pieceHandler when needed
}

function pieceHandler(socket, pieces, queue, torrent, fileHandles, files, pieceResp) {
  pieces.addReceived(pieceResp);

  const pieceIndex = pieceResp.index;
  const pieceOffset = BigInt(pieceIndex) * BigInt(torrent.info['piece length']);
  const pieceLength = BigInt(torrentParser.pieceLen(torrent, pieceIndex));
  const pieceData = pieceResp.block;

  files.forEach((file, index) => {
    const fileStart = file.start;
    const fileEnd = file.end;

    const overlapStart = pieceOffset > fileStart ? pieceOffset : fileStart;
    const overlapEnd = (pieceOffset + pieceLength) < fileEnd ? (pieceOffset + pieceLength) : fileEnd;

    if (overlapStart < overlapEnd) {
      const offsetInPiece = overlapStart - pieceOffset;
      const offsetInFile = overlapStart - fileStart;
      const length = overlapEnd - overlapStart;

      const dataToWrite = pieceData.slice(Number(offsetInPiece), Number(offsetInPiece + length));
      try {
        fs.writeSync(fileHandles[index], dataToWrite, 0, dataToWrite.length, Number(offsetInFile));
      } catch (err) {
        console.error(`Error writing to file ${file.path}: ${err.message}`);
      }
    }
  });

  if (pieces.isDone()) {
    console.log('Download complete!');
    socket.end();
    fileHandles.forEach(handle => {
      try { fs.closeSync(handle); } catch (e) {}
    });
  } else {
    requestPiece(socket, pieces, queue);
  }
}