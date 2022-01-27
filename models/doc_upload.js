const mongoose = require("mongoose");
const schema = mongoose.Schema

const documentSchema = new schema({
    document: {
        type: String,
        required: true
    },
    document_name: {
        type: String,
        required: true
    },
    subFolderId: {
        type: String,
    },
    rootFolderId: {
        type: String,
    },
    userId: {
        type: String
    }
})

module.exports = mongoose.model("uploadDocument", documentSchema);

