const mongoose = require("mongoose");
const schema = mongoose.Schema

const renewalNotesSchema = new schema({
    notes: {
        type: String,
        required: true
    },
    userId: {
        type: String,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("smartList", renewalNotesSchema);

