const mongoose = require("mongoose");
const schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const goalSchema = new schema(
    {
        parent: { type: schema.Types.ObjectId, ref: 'goals' },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        icon: {
            type: String,
        },
        color: {
            type: String,
        },
        type: {
            type: String,
            trim: true,
            enum: ['personal', 'mymember'],
        },
        goal_type: {
            type: String,
            trim: true,
            enum: ['daily', 'fixed'],
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        complete_days: {
            type: Array,
        },
        current: {
            type: Number,
        },
        goal: {
            type: Number,
        },
        priority: {
            type: Number,
        },
        status: {
            type: Number,
            required: true,
            default: 1
        },
        label: {
            type: String,
        },
        category: {
            type: String,
        },
        userId: {
            type: String,
            index: true
        }
    },
    { timestamps: true }
);
goalSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("goals", goalSchema);