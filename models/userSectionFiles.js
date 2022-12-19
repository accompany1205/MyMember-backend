const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSectionFiles = new schema({
    fileName: {
        type: String,
        required: true
    },
    SettingFile: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        index:true
    },
    isApprove:{
        type:Boolean,
        default: false
    },
    isSubmit:{
        type:Boolean,
        default: false
    },
    userId: {
        type: String,
        index:true
    },
    description: {
        type: String,
        required: true
    }
},
    { timestamps: true }

)

module.exports = mongoose.model("usersectionfiles", userSectionFiles)