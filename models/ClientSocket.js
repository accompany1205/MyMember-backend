const mongoose = require("mongoose");

const ClientSocketSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true
    },
    socketId: {
      type: String,
      required: true
    },
  }
)

const ClientSocket = mongoose.model("ClientSocket", ClientSocketSchema);
module.exports = ClientSocket;
