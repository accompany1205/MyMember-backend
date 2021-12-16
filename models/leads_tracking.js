const mongoose = require("mongoose");
const schema = mongoose.Schema

const leads_trackSchema = new schema({
    leads_category: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("leads_tracking", leads_trackSchema);

