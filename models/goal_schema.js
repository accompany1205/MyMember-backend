const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// const todoSchema = new mongoose.Schema(
//     {
//         subject: {
//             type: String,
//             trim: true,
//             required: true,
//             maxlength: 32
//         },

//         goal_category: {type: String, required: true},

//         compeleting_Date: {
//             type: String,
//             required: true
//         },
//          reminder_Date: {
//             type: String,
//             required: true
//         }, 
//         tag: {
//             type: String,
//             required: true
//         },
//          goal_status: {
//             type: String,
//             required: true
//         },
//         notes:{ type: String, required: true },
//         userId:{
//             type:String
//         }
//     },
//     { timestamps: true }
// );
const goalSchema = new mongoose.Schema(
    {
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'goals' },
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
            enum : ['personal','mymember'],
        },
        goal_type : {
            type: String,
            trim: true,
            enum : ['daily','fixed'],
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        complete_days: {
           type : Array,
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
            default : 1
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
goalSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("goals", goalSchema);