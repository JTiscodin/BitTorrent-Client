const net = require('net');
const buffer = require('buffer').Buffer;
const tracker = require('./tracker');

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
    socket.on('data', data => {
        // handle response
    });
}