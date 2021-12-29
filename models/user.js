const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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
        isverify: {
            type: Boolean,
            default: false //for email verify status
        },
        emailToken: {
            type: String
        },
        app_id: {
            type: String
        },
        auth_key: {
            type: String
        },
        epi: {
            type: String
        },
        descriptor: {
            type: String
        },
        product_description: {
            type: String
        },
        role: {
            type: Number,
            default: 0 // diffrentiate between school and admin
        },
        status: {
            type: String,
            default: 'Inactive' // school status active and diactive by admin
        },
        bussinessname: {
            type: String,
            trim: true,
            maxlength: 100
        },
        bussinessAddress: {
            type: String,
            trim: true,
            maxlength: 100
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 100
        },
        accountNumber: {
            type: Number
        },
        secondary_phone: {
            type: String
        },
        industry: {
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
        secondary_Email: {
            type: String
        },
        password: {
            type: String,
        },
        about: {
            type: String,
            trim: true
        },
        history: {
            type: Array,
            default: []
        },
        website: {
            type: String
        },
        bussinessEmail: {
            type: Array
        },
        country: {
            type: String
        },
        state: {
            type: String
        },
        city: {
            type: String
        },
        street: {
            type: String
        },
        location_name: {
            type: String
        },
        location_address: {
            type: String
        },
        zipPostal_code: {
            type: String,
            default: ''
        },
        tax_id: {
            type: String
        },
        landing_page: {
            type: String
        },
        logo: {
            type: String,
            default: ' '
        },
        start_date: {
            type: String
        },
        reset_token: {
            type: String,
            default: ''
        },
        user_membership_details: [{
            type: schema.Types.ObjectId,
            ref: "buy_membership_user"
        }],
        renewal_appoinment_history: [{
            type: schema.Types.ObjectId,
            ref: 'studentAppoinment'
        }],
        renewal_history: [{
            type: schema.Types.ObjectId,
            ref: 'renewalNote'
        }],
        birthday_appoinment_history: [{
            type: schema.Types.ObjectId,
            ref: 'birthdayAppoinment'
        }],
        birthday_note_history: [{
            type: schema.Types.ObjectId,
            ref: 'birthdayNote'
        }],
        birthday_checkList_history: [{
            type: schema.Types.ObjectId,
            ref: 'birthdayChecklist'
        }],
        missYouCall_note_history: [{
            type: schema.Types.ObjectId,
            ref: 'missYouCallNote'
        }],
        missYouCall_appoinment_history: [{
            type: schema.Types.ObjectId,
            ref: 'missYouCallAppoinment'
        }],
        fullName: {
            type: String,
        },
        // userName: {
        //     type: String,
        // },
        user_type: {
            type: String
        },
        // phone: {
        //     type: String,
        // },
        // email: {
        //     type: String,
        // },
        // password: {
        //     type: String,

        // },
        // status: {
        //     type: String,

        // },
        profile_type: {
            type: String,

        },
        profile_image: {
            type: String,
            default: ''
        },
        schoolId: {
            type: String
        },
        reset_code: {
            type: String,
            default: ''
        },
        resetPasswordToken: {
            type: String,
            default: ''
        },
        resetPasswordExpires: {
            type: String,
            default: ''
        },
        sendgridVerification: [{
            isVerified: {
                type: Boolean,
                default: false
            },
            email:{
                type:String
            },
            link:{
                type:String
            },
            staffName:{
                type:String
            },
            password:{
                type:String
            }
        }]
    },
    { timestamps: true }
);

// virtual field
// userSchema
//     .virtual('password')
//     .set(function(password) {
//         this._password = password;
//         this.salt = uuidv4()
//         this.hashed_password = this.encryptPassword(password);
//     })
//     .get(function() {
//         return this._password;
//     });

// userSchema.methods = {
//     authenticate: function(plainText){
//         return this.encryptPassword(plainText) === this.hashed_password;
//     },

//     encryptPassword: function(password){
//         if (!password) return '';
//         try{
//             return crypto
//                 .createHmac('sha1', this.salt)
//                 .update(password)
//                 .digest('hex');
//         }catch (err){
//             return '';
//         }
//     }
// };

module.exports = mongoose.model('User', userSchema);
