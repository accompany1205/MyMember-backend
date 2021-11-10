const mongoose = require("mongoose");
const schema = mongoose.Schema

const docSubFolder = new schema({
    subFolderName:{
        type:String,
        require:true,
        unique:true
    },
})

module.exports = mongoose.model("docsubfolder", docSubFolder);

