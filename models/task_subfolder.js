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
        ref:"taskfolder",
        index:true
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

module.exports = mongoose.model("tasksubfolder", docSubFolder);

