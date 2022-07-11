const mongoose = require('mongoose');

const schema = mongoose.Schema
const userSchema = new schema(
    {
        userId:{
            type:String
        },
        rolename: {
            type: String,
            trim: true,
            maxlength: 100
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

module.exports = mongoose.model('roles_list', userSchema);  