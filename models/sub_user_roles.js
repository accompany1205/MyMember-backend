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
            trim: true,
            type: String,
            index:true

        },
        profile_img: {
            type: String
        },
        userId: {
            type: String,
            index:true
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
        status: {
            type: String,
            default: 'Inactive' // school status active and diactive by admin
        },
        sub_user_type: {
            type: Boolean,
            default: true
        },
        email: {
            type: String,
            trim: true,
            // unique: true
        },
        role: {
            type: String,
            trim: true,
            maxlength: 100
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
            event_manager:{
                type:Boolean,
                default:false
            },
            form_builder:{
                type:Boolean,
                default:false
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