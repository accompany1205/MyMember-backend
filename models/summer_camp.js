const mongoose = require("mongoose");
const schema = mongoose.Schema

const summer_camp_Schema = new schema({
    summer_camp_category: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        index:true
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("summer_camp_", summer_camp_Schema);

