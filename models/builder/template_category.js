const mongoose = require("mongoose");
const schema = mongoose.Schema
const templateCategorySchema = new mongoose.Schema(
    {
        typeId: {
            type: schema.Types.ObjectId,
            ref:'template_category_type',
            index: true
        },
        name: {
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

module.exports = mongoose.model("template_category", templateCategorySchema);
