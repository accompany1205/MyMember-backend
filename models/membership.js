const mongoose = require('mongoose');
const schema = mongoose.Schema;
const membershipSchema = schema({

    membership_name: {
        type: String,
        required: true
    },
    membershipDoc: {
        type: Array
    },
    membershipThumbnail: {
        type: String
    },
    color: {
        type: String,
        required: true
    },
    membership_type: {
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
    total_price: {
        type: Number,
        required: true
    },
    down_payment: {
        type: Number,
        required: true
    },
    payment_type: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    // payment_time:{
    //     type:String,
    //     required:true
    // },
    // payments_types:{
    //     type:String,
    //     required:true
    // },
    payment_Date: {
        type: Date
    },
    due_every: {
        type: String,
        required: true
    },
    isfavorite: {
        type: Number,
        default: 0
    },
    isSignatured: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String
    },
    adminId: {
        type: String
    },
    folderId: {
        type: schema.Types.ObjectId,
        ref: 'membershipFolder'
    },

},
    { timestamps: true }
)

module.exports = mongoose.model('membership', membershipSchema)