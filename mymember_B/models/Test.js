const mongoose = require("mongoose");
const schema = mongoose.Schema

const TestSchema = new schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    memberprofileImage:{
        type:String
    },
    date_of_exam:{
        type:String
    },
    studentBeltSize:{
        type:String
    },
    category:{
        type:String
    },
    program:{
        type:String
    },
    programColor:{
        type:String,

    },
    programId:{
        type:String
    },
    start_date:{
        type:String
    },
    date_paid:{
        type:String,
        default:""
    },
    amount:{
        type:String,
        default:""
    },
    current_rank_img:{
        type:String,
        default:""
    },
    current_rank_name:{
        type:String,
        default:""
    },
    next_rank_name:{
        type:String,
        default:""
    },
    next_rank_img:{
        type:String,
        default:""
    },
    next_rank_id:{
        type:String,
        default:""
    },
    method:{
        type:String,
        default:""
    },
  
    userId:{
        type:String
    }

})

module.exports = mongoose.model("test_info", TestSchema);

