const mongoose = require("mongoose");
var schema = mongoose.Schema;
var pcategorySchema = new schema(
    {
        category:{
            type: String,
            required: true,
        },
        programName:{
            type: String
        },
        program_subcategory:[{
            type:schema.Types.ObjectId,
            ref:'psubcategory'
        }],
        userId:{
            type:String,
            index:true
        },
        adminId:{
            type:String,
            index:true
        }
    },
);

module.exports = mongoose.model("pcategory", pcategorySchema);
