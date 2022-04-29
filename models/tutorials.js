const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tutorialSchema = schema(
    {
        url: {
            type: String,
            unique: true,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        subfolderId: {
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
