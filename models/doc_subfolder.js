const mongoose = require("mongoose");
const schema = mongoose.Schema

const docSubFolder = new schema({
    subFolderName: {
        type: String,
        require: true,
        unique: true
    },
    document: [
        {
            type: schema.Types.ObjectId,
            ref: "",
        },
    ],
    userId: {
        type: String
    }
})

module.exports = mongoose.model("docsubfolder", docSubFolder);

