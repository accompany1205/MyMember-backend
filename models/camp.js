const mongoose = require("mongoose");
const schema = mongoose.Schema

const campSchema = new schema({
    campName:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        index:true
    }
})

module.exports = mongoose.model("camp", campSchema);

