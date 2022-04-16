const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tutorialSchema = schema(
    {
        url: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
        },
        folderId: {
            type: String,
        },
        userId: {
            type: String,
        },
        adminId: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tutorial", tutorialSchema);
