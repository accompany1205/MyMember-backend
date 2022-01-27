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
        ref: 'sentOrscheduleEmail'
    }],
    userId: {
        type: String
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('composeFolder', composefolderSchema)