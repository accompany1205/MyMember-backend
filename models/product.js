const mongoose = require("mongoose");
const schema = mongoose.Schema

const productSchema = new schema(
    {
        product_name: {
            type: String,
            required: true
        },
        product_description: {
            type: String,
            required: true
        },
        programName: {
            type: String,
            required: true
        },
        total_price: {
            type: Number,
            required: true
        },
        productFile: {
            type: String
        },
        color: {
            type: String,
            required: true
        },
        userId: {
            type: String
        },
        folderId: {
            type: schema.Types.ObjectId,
            ref: 'productFolder'
        }
    }, { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
