const mongoose = require("mongoose");
const schema = mongoose.Schema;


const appointCategorySchema = new schema(
    {
        app_event_name: {
            type: String,
            required: true
        },
        app_color: {
            type: String,
            required: true
        },
        category: {
            type: String
        },
        createdBy: {
            type: String
        },
        userId: {
            type: schema.Types.ObjectId,
            index: true
        },
        adminId: {
            type: schema.Types.ObjectId,
            index: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AppointmentCategory", appointCategorySchema);