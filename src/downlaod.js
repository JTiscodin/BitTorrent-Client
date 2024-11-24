const net = require('net');
const buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const { on } = require('events');

module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach(download);
    });
}

function downlaod(peer) {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        // socket.write()...
    });
    onWholeMsg(socket, data =>{
        //handle response
    });
}

function onWholeMsg(socket, callback) {
    let savedBuf = buffer.alloc(0);
    let handshake = true;

    socket.on('data', recvBuf => {
        //msgLen calculates the length of the message
        const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
        savedBuf = Buffer.concat([savedBuf, recvBuf]); 

        while(savedBuf.length >= 4 && savedBuf.length >= msgLen()){

            callback(savedBuf.slice(0,msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
        }
    });
}