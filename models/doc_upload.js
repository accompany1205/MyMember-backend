const mongoose = require("mongoose");
const schema = mongoose.Schema

const documentSchema = new schema({
    document:{
        type:String,
        require:true
    },
    document_name:{
        type:String,
        require:true
    },
    subFolderId:{
        type:String,
        require:true
    },
    rootFolderId:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model("uploadDocument", documentSchema);

