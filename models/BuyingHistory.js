const mongoose = require('mongoose');


const schema = mongoose.Schema
const BuyCredits_Schema = new schema(
    {
        creditsBuy: {
            type: String
        },
        userId: {
            type: String
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model('Buy_Credit', BuyCredits_Schema);
