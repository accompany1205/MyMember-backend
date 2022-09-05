const mongoose = require("mongoose");
const schema = mongoose.Schema

const docFolderSchema = new schema({
    folderName: {
        type: String,
        // unique: true,
        required: true
    },
    subFolder: [{
        type: schema.Types.ObjectId,
        ref: 'goalssubfolder'
    }],
    userId: {
        type: String,
        index: true
    },
    adminId: {
        type: String,
        index: true
    }
})

module.exports = mongoose.model("goalsfolder", docFolderSchema);

