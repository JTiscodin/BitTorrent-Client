const net = require('net');
const buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const { on } = require('events');
const message = require('./message');

module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach(peer => download(peer, torrent));
    });
}

function downlaod(peer) {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        // socket.write()...
        socket.write(message.buildHandshake(torrent));
    });
    onWholeMsg(socket, data =>{
        //handle response
        onWholeMsg(socket, msg => msgHandler(msg, socket));
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

function isHandshake(msg){
    return msg.length === msg.readUInt8(0) + 49 && msg.toString('utf8',1) === 'BitTorrent protocol';
}

function msgHandler(msg,socket){
    if(isHandshake(msg)){
        socket.write(message.buildInterested());
    }
    else{
        const m = message.parse(msg);
        if(m.id == 0) chokeHandler();
        if(m.id == 1) unchokeHandler();
        if(m.id == 4) haveHandler(m.payload);
        if(m.id == 5) bitfieldHandler(m.payload);
        if(m.id == 7) pieceHandler(m.payload);
    }
        
}

function chokeHandler(){}

function unchokeHandler(){}

function haveHandler(payload){}

function bitfieldHandler(payload){}

function pieceHandler(payload){}
