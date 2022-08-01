const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({

    title: {
        type: String,
        default: "Form Title"
    },
    created_on: {
        type: Date,
        default: Date.now(),
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId
    },
    number_of_submissions: {
        type: Number,
        default: 0
    },
    formBody: {
        type: String
    },
    formStyle: {
        type: String
    },
    formScript: {
        type: String
    },
    enabled: {
	type: Boolean,
	default: true
    },
    deleted: {
       type: Boolean,
       default: false
    },
    favourite: {
       type: Boolean,
       default: false
    },
    archived: {
       type: Boolean,
       default: false
    },
    action: {
	type: String
    },
    formData: {
	type: String
    }

})

const Form = mongoose.model('Form', FormSchema)

module.exports = Form
