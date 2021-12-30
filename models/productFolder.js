const mongoose = require("mongoose");
const schema = mongoose.Schema;
const productFolderSchema = schema(
  {
    folderName: {
      type: String,
      unique: true,
      required: true,
    },
    TestFeess: [
      {
        type: schema.Types.ObjectId,
        ref: "TestFees",
      },
    ],
    userId: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("productFolder", productFolderSchema);
