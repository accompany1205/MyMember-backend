const mongoose = require("mongoose");
const schema = mongoose.Schema

const docSubFolder = new schema({
    subFolderName: {
        type: String,
        require: true,
        // unique: true
    },
    tasks: [
        {
            type: schema.Types.ObjectId,
            ref: "tasks",
        },
    ],
    folderId: {
        type: String,
    },
    userId: {
        type: String
    },
    adminId: {
        type: String
    }
})

module.exports = mongoose.model("tasksubfolder", docSubFolder);

