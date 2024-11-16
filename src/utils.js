import crypto from "crypto";

const id = null;

export const genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    //Name of the client "JT" version "00001"
    Buffer.from("-JT0001").copy(id,0);
  }
  return id;
};
