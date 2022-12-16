const mongoose = require("mongoose");

const templateCategoryTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    }
);

module.exports = mongoose.model("template_category_type", templateCategoryTypeSchema);

