const mongoose = require("mongoose");
const schema = mongoose.Schema

const docFolderSchema = new schema({
    folderName: {
        type: String,
        // unique: true,
        required: true
    },
    // tasks: [
    //     {
    //         type: schema.Types.ObjectId,
    //         ref: "tasks",
    //     },
    // ],
    subFolder: [{
        type: schema.Types.ObjectId,
        ref: 'tasksubfolder'
    }],
    userId: {
        type: String,
        index:true
    },
    adminId: {
        type: String,
        index:true
    }
})

module.exports = mongoose.model("taskfolder", docFolderSchema);

