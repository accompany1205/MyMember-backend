const mongoose = require("mongoose");
const schema = mongoose.Schema;

const funnelContact = new schema({
    studentType: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    program: {
        type: String,
        def: "No Program"
    },
    funnelId: {
        type: schema.Types.ObjectId
    },
    primaryPhone: {
        type: String,
    },
    formId: {
        type: schema.Types.ObjectId,
        ref: 'Form'
    },
    userId: {
        type: schema.Types.ObjectId
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("funnelContact", funnelContact);
