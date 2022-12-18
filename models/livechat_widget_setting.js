const mongoose = require("mongoose");

const LiveChatWidgetSettingSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    maximized: {
        type: String, // Enum type: Smooth or Modern, possibly add more option
        required: true,
        default: 'smooth', 
    },
    minized: {
        type: String, // Enum type: Bar or Bubble, possibly add more option
        required: true,
        default: "bubble",
    },
    theme: {
        type: String, // Enum type: Light or Dark, modify background color and text color
        required: true,
        default: "light"
    },
    themeColor: {
        type: String, // #FFFFFF For e.g
        required: true,
        default: "#2000F0"
    },
    moreOptions: {
        type: Object,
        required: false,
        default: {},
    },
    alignTo: {
        type: String, // Enum type Right or left
        required: true,
        default: "right"
    },
    sideSpacing: {
        type: Number,
        required: false,
        default: 0,
    },
    bottomSpacing: {
        type: Number,
        required: true,
        default: 0,
    }
})

module.exports = mongoose.model("Livechatwidget-setting", LiveChatWidgetSettingSchema);