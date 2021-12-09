const mongoose = require("mongoose");
const schema = mongoose.Schema
const stripeSchema = new schema(
    {
        candidateName: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxlength: 32
        },
        color: {
            type: String,
            required: true
        },
        lable: {
            type: String,
            required: true
        },
        total_stripe: {
            type: String,
            required: true
        },
        progression: {
            type: String,
            required: true
        },
        stripe_image: {
            type: String
        },
        manageCandidatesStripe: [
            {
                type: schema.Types.ObjectId,
                ref: 'manageCandidatesStripe'
            },
        ],
        userId: {
            type: schema.Types.ObjectId,
        },
        status: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("candidatesStripe", stripeSchema);
