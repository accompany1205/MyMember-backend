const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
    {
        subject:{
            type:String,
            required:true
        },
        type:{
            type:String,
            required:true
        },
        location:{
            type:String,
            required:true
        },
       description:{
            type:String,
        },
        ticket_image:{
            type:String,
        },
        date:{
            type:Date,
            default:new Date()
        },
        status: {
            type: String,
            default: "Open",
            enum: ["Open", "Closed", "Archived", "OnHold", "Pending"] 
        },
        userId:{
            type:String,
            index:true
        }
    }
);

module.exports = mongoose.model("support", supportSchema)