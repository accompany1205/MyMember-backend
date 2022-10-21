const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const schema = mongoose.Schema
const userPakagesSchema = new schema(
    {
        credits: {
            type: Number,
        },
        userId:{
            type: schema.Types.ObjectId,
            ref:"User"
        },
        userDocumentId:{
            type: String
        }
    },
    { timestamps: true }
);



module.exports = mongoose.model('User_pakages', userPakagesSchema);
