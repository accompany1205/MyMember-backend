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
      index:true
    },
    adminId: {
      type: String,
      index:true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("productFolder", productFolderSchema);
