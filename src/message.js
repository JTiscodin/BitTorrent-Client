const Buffer = require('buffer').Buffer;
const torrentParser = require('./torrent-parser');


module.exports.buildHandshake = torrent => {
    const buf = Buffer.alloc(68);

    buf.writeUInt8(19, 0);
    buf.write('BitTorrent protocol', 1);

    //reserved
    buf.writeUInt32BE(0, 20);
    buf.writeUInt32BE(0, 24);

    //info hash
    torrentParser.infoHash(torrent).copy(buf, 28);
    //peer id
    buf.write(getutil.genId());
    return buf;
};

module.exports.buildKeepAlive = () => Buffer.alloc(4);

module.exports.buildChoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0); //length
    Buffer.writeUInt8(0, 4); //id
    return buf;
};

module.exports.buildUnchoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0); //length
    Buffer.writeUInt8(1, 4); //id
    return buf;
};

module.exports.buildInterested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0); //length
    Buffer.writeUInt8(2, 4); //id
    return buf;
};

module.exports.buildUninterested = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0); //length
    Buffer.writeUInt8(3, 4); //id
    return buf;
};

module.exports.buildHave = payload => {
    const buf = Buffer.alloc(9);
    buf.writeUInt32BE(5, 0); //length
    Buffer.writeUInt8(4, 4); //id
    buf.writeUInt32BE(payload, 5); //piece index
    return buf;
};

module.exports.buildBitfield = bitfield => {
    const buf = Buffer.alloc(14);
    buf.writeUInt32BE(1 + bitfield.length, 0); //length
    Buffer.writeUInt8(5, 4); //id
    bitfield.copy(buf, 5);
    return buf;
};

module.exports.buildRequest = payload => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0); //length
    Buffer.writeUInt8(6, 4); //id
    buf.writeUInt32BE(payload.index, 5); //piece index
    buf.writeUInt32BE(payload.begin, 9); //begin
    buf.writeUInt32BE(payload.length, 13); //length
    return buf;
};

module.exports.buildPiece = payload =>{
    const buf = Buffer.alloc(13 + payload.block.length);
    buf.writeUInt32BE(9 + payload.block.length, 0); //length
    Buffer.writeUInt8(7, 4); //id
    buf.writeUInt32BE(payload.index, 5); //piece index
    buf.writeUInt32BE(payload.begin, 9); //begin
    payload.block.copy(buf, 13);
    return buf;
};

module.exports.buildCancel = payload => {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0); //length
    Buffer.writeUInt8(8, 4); //id
    buf.writeUInt32BE(payload.index, 5); //piece index
    buf.writeUInt32BE(payload.begin, 9); //begin
    buf.writeUInt32BE(payload.length, 13); //length
    return buf;
};

module.exports.buildPort = payload => {
    const buf = Buffer.alloc(7);
    buf.writeUInt32BE(3, 0); //length
    Buffer.writeUInt8(9, 4); //id
    buf.writeUInt16BE(payload, 5); //listen-port
    return buf;
};