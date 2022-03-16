const mongoose = require('mongoose');
const schema = mongoose.Schema
const composefolderSchema = schema({
    folderName: {
        type: String,
        unique: true,
        require: true
    },
    template: [{
        type: schema.Types.ObjectId,
        ref: 'email_template'
    }],
    userId: {
        type: String
    },
    adminId: {
        type: String
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('composeFolder', composefolderSchema)