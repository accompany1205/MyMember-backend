const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
    {
        seq_value: {
            type: Number,
            required: true,
        },
    }
);

module.exports = mongoose.model("counters", counterSchema);

