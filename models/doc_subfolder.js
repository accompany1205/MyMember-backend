const mongoose = require("mongoose");
const schema = mongoose.Schema

const docSubFolder = new schema({
    subFolderName: {
        type: String,
        require: true,
        // unique: true
    },
    document: [
        {
            type: schema.Types.ObjectId,
            ref: "",
        },
    ],
    folderId: {
        type: String,
    },
    userId: {
        type: String,
        index:true
    },
    adminId: {
        type: String,
        index:true
    }
})

module.exports = mongoose.model("docsubfolder", docSubFolder);

