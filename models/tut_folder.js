const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tutFolderSchema = schema(
  {
    folderName: {
      type: String,
      // unique: true,
      required: true,
    },
    subFolder: [
      {
        type: schema.Types.ObjectId,
        ref: "tutSubFolder",
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

module.exports = mongoose.model("tutFolder", tutFolderSchema);
