const mongoose = require("mongoose");
const schema = mongoose.Schema;
const productFolderSchema = schema(
  {
    folderName: {
      type: String,
      unique: true,
      required: true,
    },
    products: [
      {
        type: schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    userId: {
      type: String,
    },
    adminId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("productFolder", productFolderSchema);
