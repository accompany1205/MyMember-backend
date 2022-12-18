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
        twilio: {
            type: String,
            unique: true,
            index: true
        },
        isverify: {
            type: Boolean,
            default: false
        },
        isEmailverify: {
            type: Boolean,
            default: false //for email verify status
        },
        otp: {
            type: String,
            unique: true
        },
        otp_expiration_time: {
            type: Date,
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
        mainUser: {
            type: String
        },
        issubUser: {
            type: Boolean,
            default: false // diffrentiate between user and subuser
        },
        subUsers: [{
            type: schema.Types.ObjectId,
            ref: "User"
        }],
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
        signature: {
            type: String
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
        locationName: {
            type: String,
            unique: true,
            trim: true,
            maxlength: 100
        },
        default_location: [{
            type: schema.Types.ObjectId,
            ref: "location"
        }],
        locations: [{
            type: schema.Types.ObjectId,
            ref: "User"
        }],
        isAccessLocations: {
            type: Boolean,
            default: false
        },
        employeeId:[{
            type: schema.Types.ObjectId,
            ref:'usersectionfiles',
            default:[]
        }],
        isLocation: {
            type: Boolean,
            default: false
        },
        location_address: {
            type: String
        },
        isLogin: {
            type: Date
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
        profile_type: {
            type: String,

        },
        profile_image: {
            type: String,
            default: ''
        },
        schoolId: {
            type: String,
            index: true,
            index: true

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
        textCredit: {
            type: Number
        },
        textCreditHistory: [{
            creaditedDate: {
                type: String
            },
            credits: {
                type: Number
            }
        }],
        sendgridVerification: [{
            isVerified: {
                type: Boolean,
                default: false
            },
            email: {
                type: String
            },
            link: {
                type: String
            },
            staffName: {
                type: String
            },
            password: {
                type: String
            },

        }],
        stripe_pub: {
            type: String
        },
        stripe_sec: {
            type: String
        },
        stripe_name: {
            type: String
        },
        task_setting: {
            type: Boolean,
            default: true
        },
        chat_setting: {
            type: Boolean,
            default: true
        },
        thisWeek_birthday_setting: {
            type: Boolean,
            default: false
        },
        thisMonth_birthday_setting: {
            type: Boolean,
            default: false
        },
        lastMonth_birthday_setting: {
            type: Boolean,
            default: false
        },
        nextSixtyDays_birthday_setting: {
            type: Boolean,
            default: false
        },
        nextNintyDays_birthday_setting: {
            type: Boolean,
            default: false
        },
        event_notification_setting: {
            type: Boolean,
            default: true
        },
        purchased_Num: {
            type: String
        },
        customer_id: {
            type: String
        },
        sub_id: {
            type: String
        },
        is_Already_Purchase: {
            type: Boolean,
        },
        thirtydays_expire_notification_setting_renewal: {
            type: Boolean,
            default: false
        },
        sixtydays_expire_notification_setting_renewal: {
            type: Boolean,
            default: false
        },
        nintydays_expire_notification_setting_renewal: {
            type: Boolean,
            default: false
        },
        expire_notification_setting: {
            type: Boolean,
            default: false
        },
        frozen_notification_setting: {
            type: Boolean,
            default: false
        },

        // Livechat widget configuration
        
        maximized: {
            type: String, // Enum type: Smooth or Modern, possibly add more option
            required: true,
            default: 'smooth', 
        },
        minized: {
            type: String, // Enum type: Bar or Bubble, possibly add more option
            required: true,
            default: "bubble",
        },
        theme: {
            type: String, // Enum type: Light or Dark, modify background color and text color
            required: true,
            default: "light"
        },
        themeColor: {
            type: String, // #FFFFFF For e.g
            required: true,
            default: "#2000F0"
        },
        moreOptions: {
            type: Object,
            required: false,
            default: {},
        },
        alignTo: {
            type: String, // Enum type Right or left
            required: true,
            default: "right"
        },
        sideSpacing: {
            type: Number,
            required: false,
            default: 0,
        },
        bottomSpacing: {
            type: Number,
            required: true,
            default: 0,
        }

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
