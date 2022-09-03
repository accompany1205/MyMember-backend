const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tutorialSchema = schema(
    {
        url: {
            type: String,
            // unique: true,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        subfolderId: {
            type: String,
            index:true
        },
        userId: {
            type: String,
            index:true
        },
        adminId: {
            type: String,
            index:true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tutorial", tutorialSchema);
