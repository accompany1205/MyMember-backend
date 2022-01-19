const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const subGoalSchema = new mongoose.Schema(
        {
        goal : { type: mongoose.Schema.Types.ObjectId, ref: 'goals' },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        icon: {
            type: String,
        },
        color : {
            type: String,
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        type: {
            type: String,
            trim: true,
            enum : ['daily','weekly' , 'monthly' , 'yearly'],
        },
        priority: {
            type: Number,
        },
        status: {
            type: Number,
            required: true
        },
        label: {
            type: String,
        },
        category: {
            type: String,
        }, 
        userId: {
            type: String,
        }
    },
    { timestamps: true }
);
subGoalSchema.plugin(mongoosePaginate);


module.exports = mongoose.model("sub_goal", subGoalSchema);
