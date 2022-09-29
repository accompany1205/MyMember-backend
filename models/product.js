const mongoose = require("mongoose");
const schema = mongoose.Schema

const productSchema = new schema(
    {
        product_name: {
            type: String,
            unique: true,
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
        // programName: {
        //     type: String,
        // },
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
        amount: {
            type: String,
        },
        balance: {
            type: String,
        },
        no_of_payment: {
            type: String,
        },
        duration_type: {
            type: String,
        },
        duration_time: {
            type: String
        },
        isRecurring: {
            type: Number
        },
        userId: {
            type: String,
            index:true
        },
        folderId: {
            type: schema.Types.ObjectId,
            ref: 'productFolder'
        },
        adminId: {
            type: String,
            index:true
        },
    }, { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
