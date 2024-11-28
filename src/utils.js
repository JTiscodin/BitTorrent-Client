'use strict';

// const crypto = require('crypto');
import crypto from 'crypto';

let id = null;

const genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    // Name of the client "JT" version "00001"
    Buffer.from("-JT0001").copy(id, 0);
  }
  return id;
};

export default {genId};
