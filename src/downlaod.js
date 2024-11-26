const net = require('net');
const buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const { on } = require('events');
const message = require('./message');
const Pieces = require('./Pieces');
const Queue = require('./Queue');


module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        const pieces = new Pieces(torrent);
        peers.forEach(peer => download(peer, torrent, pieces));
    });
}

function downlaod(peer,torrent,pieces){ {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        // socket.write()...
        socket.write(message.buildHandshake(torrent));
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket, msg => msgHandler(msg, socket, pieces, queue));
  
}
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
        if(m.id == 1) unchokeHandler(socket, pieces, queue);
        if(m.id == 4) haveHandler(m.payload);
        if(m.id == 5) bitfieldHandler(m.payload);
        if(m.id == 7) pieceHandler(m.payload);
    }
        
}

function chokeHandler(){}

function unchokeHandler(socket, piece,queue){
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}

function haveHandler(payload){}

function bitfieldHandler(payload){}

function pieceHandler(payload){}


//4.9.1

module.exports = torrent => {
    const requested = [];
    tracker.getPeers(torrent, peers => {
        peers.forEach(peer => download(peer, torrent, requested));
    });
};

function download(peer, torrent, requested) {
    ///...
    const queue = [];
    onWholeMsg(socket, msg => msgHandler(msg, socket, requested, queue));
}

function msgHandler(msg , socket , requested){
    //...
    if(m.id === 4) {
        // console.log('have');
        return haveHandler(m.payload, socket, requested, queue);
    }
    if(m.id==7){
        // console.log('piece');
        return pieceHandler(m.payload, socket, requested, queue);
    }
}


function haveHandler(payload, socket, requested, queue){
    const pieceIndex = payload.readUInt32BE(0);
    queue.push(pieceIndex);
    if(queue.length === 1) requestPiece(socket, requested, queue);
    // if(!requested[pieceIndex]){
    //     socket.write(message.buildRequest(...));
    // }
    // requested[pieceIndex] = true;
    requestPeice(socket, requested, queue);
}

function pieceHandler(payload, socket, requested, queue){
    //...
    queue.shift();
    requestPiece(socket, requested, queue);
}

// function requestPeice(socket, requested, queue){
//     if(requested[queue[0]]){
//         queue.shift();
//     }else{
//         socket.write(message.buildRequest(pieceIndex));
//     }
// }

function requestPiece(socket,pieces, queue){
    if(queue.chocked) return null;
    while(queue.length()){
        const pieceBlock = queue.deque();
        if(pieces.needed(pieceBlock)){
            socket.write(message.buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
            break;
        }
    }
}
    