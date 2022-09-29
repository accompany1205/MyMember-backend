const mongoose = require("mongoose");
const schema = mongoose.Schema

const after_camp_Schema = new schema({
    after_camp_category: {
        type: String,
        trim: true,
        required: [true, "can't be blank"],
        // unique: [true, 'Tag already exist!'],
    },
    userId: {
        type: String,
        index: true
    },
    adminId: {
        type: String,
        index: true
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("after_camp_", after_camp_Schema);

