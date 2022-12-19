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
        type: String,
        default: ""
    },
    formStyle: {
        type: String,
        default: ""
    },
    formScript: {
        type: String,
        default: ""
    },
    isApprove:{
        type:Boolean,
        default: false
    },
    isSubmit:{
        type:Boolean,
        default: false
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
        type: String,
        default: "{}"
    },
    includePayment: {
        type: Boolean,
        default: false
    },
    funnelId: {
        type: mongoose.Schema.Types.ObjectId
    },
    subUserId: {
        type: mongoose.Schema.Types.ObjectId
    },
    templateId:{
        type: mongoose.Schema.Types.ObjectId
    },
    userId:{
        type:String
    }

})

const Form = mongoose.model('employeeForm', FormSchema)

module.exports = Form
