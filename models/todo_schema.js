const mongoose = require("mongoose");
const schema = mongoose.Schema;
const todoSchema = schema(
    {
        subject: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        todoDate: {
            type: String,
            required: true,
            index:true
        },
        todoTime: {
            type: String,
            required: true
        },
        tag: {
            type: String,
            required: true,
            index:true
        },
        status: {
            type: String,
            required: true,
            index:true
        },
        is_Favorite: {
            type: Boolean,
            default: false
        },
        notes: { type: String, required: true },

        userId: {
            type: String,
            index:true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
