const mongoose = require("mongoose");
const schema = mongoose.Schema

const speciality_program1_Schema = new schema({
    speciality_program1_category: {
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

module.exports = mongoose.model("speciality_program1", speciality_program1_Schema);

