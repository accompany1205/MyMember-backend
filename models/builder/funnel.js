const mongoose = require("mongoose");
const schema = mongoose.Schema

const FunnelSchema = schema({
    funnelName:{
        type:String
    },
	memberType:{
        type:String
    },
	isAutomation:{
        type:Boolean
    },
	funnelType:{
        type:String
    },
	templateBody:{
        type:String
    },
	templateName:{
        type:String
    },
    userId:{
        type:String
    },
    isDeleted :{
        type:Boolean,
        default:false
    },
    isFavorite:{
        type:Boolean,
        default:false
    },
    isArchived:{
        type:Boolean,
        default:false
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("funnel", FunnelSchema);
