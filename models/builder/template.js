const mongoose = require("mongoose");
const schema = mongoose.Schema

const TemplateSchema = schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    thumbnail:{
        type:String
    },
	categoryId:{
        type: schema.Types.ObjectId,
        ref:'template_category',
    },
    forms:[{
        type: schema.Types.ObjectId,
        ref:'Form',
        default:[]
    }],
    userId:{
        type:String
    },
    isDeleted :{
        type:Boolean,
        default:false
    },
},
    { timestamps: true }
)

module.exports = mongoose.model("template", TemplateSchema);
