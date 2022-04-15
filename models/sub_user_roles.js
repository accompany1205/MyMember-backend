const mongoose = require('mongoose');

const schema = mongoose.Schema
const userSchema = new schema(
    {
        firstname: {
            type: String,
            trim: true,
            maxlength: 100
        },
        lastname: {
            type: String,
            trim: true,
            maxlength: 100
        },
        twilio: {
            type: String,
            unique: true,
        },
        userId:{
            type:String
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 100
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            maxlength: 100
        },
        email: {
            type: String,
            trim: true,
            unique: true
        },

        password: {
            type: String,
        },

        default_location: {
            type: String,
            trim: true,
            maxlength: 100
        },
        roles: [{
            dashboard: {
                type: Boolean,
                default: false
            },
            members: {
                type: Boolean,
                default: false
            },
            my_school: {
                type: Boolean,
                default: false
            },
            task_and_goals: {
                type: Boolean,
                default: false
            },
            calendar: {
                type: Boolean,
                default: false
            },
            marketing: {
                type: Boolean,
                default: false
            },
            shop: {
                type: Boolean,
                default: false
            },
            finance: {
                type: Boolean,
                default: false
            },
            documents: {
                type: Boolean,
                default: false
            },
            settings: {
                type: Boolean,
                default: false
            }
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('sub_users_role', userSchema);  