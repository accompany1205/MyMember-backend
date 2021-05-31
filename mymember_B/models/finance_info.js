const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Finance_infoSchema = new schema(
    {
        card_type:{
            type: String,
            
        },
        holder_name:{
            type: String,
            
        },
        notes:{
            type: String,
        },
        default:{
            type: Number,
            default: 0
        },
        status:{
            type: String,
        }, 
        credit_Card_type: {
            type: String,
            
        },
        credit_Card_Number: {
            type: String,
            
        },
         credit_cvv:{
            type: String,
            
        },
        cardExpiry:{
            type:Date,
            
        },
        expiry_month: {
            type: Number,
            
        },
         expiry_year: {
            type: Number,
            
        }, 
        billing_address: {
        },
         country: {
            type: String,
           
        }, 
        state: {
            type: String,
           
        },
         city: {
            type: String,
           
        },
        zip_postal: { type: String  },

        memberInfo:[{
            type:schema.Types.ObjectId,
            ref:'member'
        }],
        userId:{
            type:String
        }
        
    },
    { timestamps: true }
);

module.exports = mongoose.model("FinanceInfo", Finance_infoSchema);
