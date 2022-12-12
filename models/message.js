const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
    {
        source:{
            type: String,
            required: true,
        },
        destination:{
            type: String,
            required: true,
        },
        content:{
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        }
    },
    {timestamps:true}
);
module.exports = mongoose.model("livechatmessage", MessageSchema);
