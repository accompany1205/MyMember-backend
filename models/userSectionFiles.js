const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSectionFiles = new schema({
    fileName:{
        type:String
    },
    SettingFile: {
        type: String
    },
    fileType: {
        type: String,
        required: true
    },
    studentId: {
        type: String
    },
    userId: {
        type: String
    },

})

module.exports = mongoose.model("usersectionfiles", userSectionFiles)