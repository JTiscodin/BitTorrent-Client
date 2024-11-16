import dgram from "dgram";

import { Buffer } from "buffer";

import { parse, URL } from "url";

import crypto from "crypto"

const torrent = bencode.decode(fs.readFileSync("gtav.torrent"));

const url = parse(torrent.announce.toString("utf8"));

export const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");

  const url = torrent.announce.toString("utf8");

  udpSend(socket, buildConnReq(), url);

  socket.on("message", (response) => {
    if (respType(response) === "connect") {
      const connResp = parseConnResp(response);

      const announceReq = buildAnnounceReq(connResp.connectionId);
      udpSend(socket, announceReq, url);
    }else if(respType(response) == "announce"){
        const announceResp = parseAnnounceResp(response);
        callback(announceResp.peers); //returning peers for the files announced.
    }
  });
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const url = parse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {}

function buildConnReq() {
    const buf = Buffer.alloc(16);

    buf.writeBigUint64BE(0x417, 0);
    buf.writeBigUInt64BE(0x27101980, 4);

    buf.writeUint32BE(0, 8);    

    crypto.randomBytes(4).copy(buf,12);

    return buf;
}

function parseConnResp(resp) {

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connection_id:  resp.slice(8)
    }
}

function buildAnnounceReq(connId) {}

function parseAnnounceResp(resp) {}
