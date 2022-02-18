const mongoose = require("mongoose");
const schema = mongoose.Schema

const docFolderSchema = new schema({
    folderName: {
        type: String,
        unique: true,
        required: true
    },
    smartlists: [
        {
            type: schema.Types.ObjectId,
            ref: "smartList",
        },
    ],
    userId: {
        type: String
    },
    adminId: {
        type: String
    },

})

module.exports = mongoose.model("smartlistFolder", docFolderSchema);

