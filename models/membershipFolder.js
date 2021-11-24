const mongoose = require('mongoose');
const schema = mongoose.Schema;
const membershipFolder = schema({
    folderName: {
        type: String,
        unique: true,
        require: true
    },
    membership: [{
        type:schema.Types.ObjectId,
        ref:'membership'
    }]
},
    { timestamps: true }
);

module.exports = mongoose.model('membershipFolder', membershipFolderSchema)