const mongoose = require("mongoose");
const schema = mongoose.Schema

const docFolderSchema = new schema({
    folderName: {
        type: String,
        // unique: true,
        required: true
    },
    document: [
        {
            type: schema.Types.ObjectId,
            ref: "uploadDocument",
        },
    ],
    subFolder: [{
        type: schema.Types.ObjectId,
        ref: 'docsubfolder'
    }],
    userId: {
        type: String,
        index:true
    },
    adminId: {
        type: String,
        index:true
    },
    createdBy: {
        type: String
    }
})

module.exports = mongoose.model("docfolder", docFolderSchema);

