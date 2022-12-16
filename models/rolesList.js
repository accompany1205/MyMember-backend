const mongoose = require('mongoose');

const schema = mongoose.Schema
const userSchema = new schema(
    {
        userId: {
            type: String,
            index: true
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
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        email: {
            type: String
        },
        mobileNo: {
            type: Number
        },
        homeNo: {
            type: Number
        },
        pronouns: {
            type: String
        },
        birthday: {
            type: Date
        },
        Address: {
            type: String
        },
        zipCode: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        contactName: {
            type: String
        },
        contactNo: {
            type: Number
        },
        digitalId:[{
            type: schema.Types.ObjectId,
            ref:'Form',
            default:[]
        }],
        documentId:[{
            type: schema.Types.ObjectId,
            ref:'usersectionfiles',
            default:[]
        }],
        taskId:[{
            type: schema.Types.ObjectId,
            ref:'Task',
            default:[]
        }],
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
            event_manager: {
                type: Boolean,
                default: false
            },
            form_builder: {
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