const mongoose = require('mongoose');
const crypto = require('crypto');
// const uuidv1 = require('uuid/v1');
// uuidv1()
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
        },
        userName: {
            type: String,
        },

        phone: {
            type: String,
        },
        email: {
            type: String,
        },
        password: {
            type: String,

        },
        status: {
            type: String,

        },
        profile_type: {
            type: String,
        },
        profile_image: {
            type: String
        },
        schoolId:{
            type:String
        },
         reset_code: {
            type: String,
            default: ''
        },
        resetPasswordToken:{
            type:String,
            default:''
        },
        resetPasswordExpires:{
            type:String,
            default:''
        }
    },
    { timestamps: true }
);

// virtual field

// userSchema
//     .virtual('password')
//     .set(function (password) {
//         this._password = password;
//         this.salt = uuidv1();
//         this.hashed_password = this.encryptPassword(password);
//     })
//     .get(function () {
//         return this._password;
//     });

// userSchema.methods = {
//     authenticate: function (plainText) {
//         console.log(this.encryptPassword(plainText))
//         return this.encryptPassword(plainText) === this.hashed_password;
//     },
//     encryptPassword: function (password) {
//         if (!password) return '';
//         try {
//             return crypto
//                 .createHmac('sha1', this.salt)
//                 .update(password)
//                 .digest('hex');
//         } catch (err) {
//             return '';
//         }
//     }
// };

module.exports = mongoose.model('administrator_users', userSchema);
