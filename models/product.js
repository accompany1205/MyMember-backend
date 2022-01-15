const mongoose = require("mongoose");
const schema = mongoose.Schema

const productSchema = new schema(
    {
        product_name: {
            type: String,
            required: true
        },
        productThumbnail: {
            type: String
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
        },
        payment_type: {
            type: String,
        },
        isSignatured: {
            type: Boolean,
            default: false
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
