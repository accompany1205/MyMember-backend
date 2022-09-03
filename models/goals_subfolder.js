const mongoose = require("mongoose");
const schema = mongoose.Schema

const docSubFolder = new schema({
    subFolderName: {
        type: String,
        require: true,
        // unique: true
    },
    goals: [
        {
            type: schema.Types.ObjectId,
            ref: "goals",
        },
    ],
    folderId: {
        type: String,
        index: true
    },
    userId: {
        type: String,
        index: true
    },
    adminId: {
        type: String,
        index: true
    }
})

module.exports = mongoose.model("goalssubfolder", docSubFolder);

