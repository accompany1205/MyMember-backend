const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const schema = mongoose.Schema
const userWalletSchema = new schema(
    {
        wallet: {
            type: Number,
        },
        cretits:{
            type: Number,
        },
        user_id: {
            type: String,
        },
        userId: {
            type: schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
);



module.exports = mongoose.model('User_wallet', userWalletSchema);
