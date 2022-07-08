const mongoose = require("mongoose");
const schema = mongoose.Schema

const stripe_cards_schema = new schema({
    customer_id:{
        type:String,
        required:true
    },
    card_id:{
        type:String,
        required:true
    },
    card_number:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("stripe_cards", stripe_cards_schema);

