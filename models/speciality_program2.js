const mongoose = require("mongoose");
const schema = mongoose.Schema

const speciality_program2_Schema = new schema({
    speciality_program2_category: {
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

module.exports = mongoose.model("speciality_program2", speciality_program2_Schema);

