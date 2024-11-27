'use strict';

const crypto = require('crypto');

let id = null;

module.exports.genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    // Name of the client "JT" version "00001"
    Buffer.from("-JT0001").copy(id, 0);
  }
  return id;
};
