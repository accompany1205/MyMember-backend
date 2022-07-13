const mongoose = require("mongoose");
const schema = mongoose.Schema;


const appointSchema = new schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        interval: {
            type: String
        },
        range: {
            type: String
        },
        appointment_type: {
            type: String,
            required: true
        },
        app_color: {
            type: String
        },
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        },
        start_time: {
            type: String,
            required: true
        },
        end_time: {
            type: String,
            required: true
        },
        notes: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false
        },
        repeatedDates: {
            type: Array
        },
        repeatedConcurrence: {
            type: String
        },
        groupInfoList: {
            type: Array
        },
        studentInfo: {
            type: Array
        },
        userId: {
            type: String
        },
        ticketType : {
            type:String
        },
        eventBanner: {
            type:String
        },
        tickeNotes : {
            type:String
        },
        hostName:{
            type:String
        },
        hostEmail: {
            type:String
        },
        hostMobileNumber: {
            type:String
        },
        hostAlternateNumber: {
            type:String
        },
        eventLocation : {
            type:String
        },
        eventStreet: {
            type:String
        },
        eventCity : {
            type:String
        },
        eventState: {
            type:String
        },
        zip : {
            type:String
        },
        ticketName: {
            type:String
        },
        ticketAvailabeQuantity: {
            type:String
        },
        ticktePrice : {
            type:String
        },
        totalIncome : {
            type:String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointSchema);
