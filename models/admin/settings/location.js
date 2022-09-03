const mongoose = require('mongoose');
const schema = mongoose.Schema
const locationSchema = schema({
    locationName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
    },
    website: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String
    },
    fax: {
        type: String
    },
    street: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zipCode: {
        type: String
    },
    adminId: {
        type: String
    },
    userId: {
        type: String,
        index: true 
    },
    createdBy: {
        type: String
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('location', locationSchema)