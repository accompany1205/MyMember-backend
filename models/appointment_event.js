const mongoose = require("mongoose");
const schema = mongoose.Schema;


const appointEventSchema = new schema(
    {
        app_type: {
            type: String,
            required: true
        },
        app_color:{
            type:String,
            required: true
        },
        createdBy: {
            type: String
        },
        userId:{
            type:schema.Types.ObjectId
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AppointmentEvent", appointEventSchema);