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
        type: String
    },
    adminId: {
        type: String
    }
})

module.exports = mongoose.model("goalsfolder", docFolderSchema);

