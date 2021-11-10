const mongoose = require('mongoose');
const schema = mongoose.Schema;
const candidateSchema = new schema({
    stdId:{
        type:String
    },
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    program:{
        type:String
    },
    category:{
        type:String
    },
    candidate_status:{
        type:String,
        default:' '
    },
    stripe_color:{
        type:String
    },
    current_stripe:{
        type:String,
    },
    next_stripe:{
        type:String,
    },
    memberprofileImage:{
        type:String
    },
    expiry_date:{
        type:String
    },
    userId:{
        type:schema.Types.ObjectId
    }
})
module.exports = mongoose.model('candidate',candidateSchema)