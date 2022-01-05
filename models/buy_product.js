const mongoose = require("mongoose");
const schema = mongoose.Schema

const productSchema = new schema(
    {
        product_name: {
            type: String,
            required: true
        },
        product_type: {
            type: String,
            required: true
        },
        product_description: {
            type: String,
            required: true
        },
        productFile: {
            type: Array
        },
        color: {
            type: String,
            required: true
        },
        isfavorite: {
            type: Number,
            default: 0
        },
        event_date: {
            type: String,
            required: true,
        },
        start_date: {
            type: String,
        },
        expiry_date: {
            type: String,
        },
        programName: {
            type: String,
            required: true
        },
        total_price: {
            type: Number,
            required: true
        },
        deposite: {
            type: Number,
            required: true
        },
        balance: {
            type: Number,
            required: true
        },
        payment_type: {
            type: String,
            required: true
        },
        due_every: {
            type: String,
            required: true
        },
        duration_time: {
            type: String,
            required: true
        },
        duration_type: {
            type: String,
            required: true
        },
        userId: {
            type: String
        },
        folderId: {
            type: schema.Types.ObjectId,
            ref: 'productFolder'
        },
        adminId: {
            type: String
        },
    }, { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
