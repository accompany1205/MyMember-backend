const mongoose = require("mongoose");
const schema = mongoose.Schema

const after_camp_Schema = new schema({
    after_camp_category: {
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

module.exports = mongoose.model("after_camp_", after_camp_Schema);

