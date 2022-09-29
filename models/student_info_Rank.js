const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;


const programSchema = new mongoose.Schema(
    {
        programName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        rank_name: {
            type: String,

        },
        studentId: {
            type: String,
            index:true
        },
        day_to_ready: {
            type: String,
            required: true
        },
        // lession_to_ready: {
        //     type: String,
        //     required: true
        // },
        // rank_order: {
        //     type: String,
        //     required: true
        // },
        rank_image: {
            type: String,
        },
        userId: {
            type: String,
            index:true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("student_info_rank", programSchema);
