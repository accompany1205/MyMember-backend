const mongoose = require('mongoose');
const schema = mongoose.Schema
const addCategorySchema = schema({
    categoryName: {
        type: String,
        // unique: true,
        required: true
    },
    category: {
        type: String,
        default: 'compose'
    },
    folder: [{
        type: schema.Types.ObjectId,
        ref: 'composeFolder'
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

module.exports = mongoose.model('compose_category', addCategorySchema)