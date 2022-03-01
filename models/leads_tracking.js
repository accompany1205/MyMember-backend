const mongoose = require("mongoose");
const schema = mongoose.Schema

const leads_trackSchema = new schema({
    leads_category: {
        type: String,
        trim: true,
        required: [true, "can't be blank"],
        unique: [true, "lead already exist!"],
    },
    userId: {
        type: String,
    },
    adminId: {
        type: String,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("leads_tracking", leads_trackSchema);

