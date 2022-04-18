const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tutFolderSchema = schema(
  {
    subfolderName: {
      type: String,
      // unique: true,
      required: true,
    },
    tutorial: [
      {
        type: schema.Types.ObjectId,
        ref: "tutorial",
      },
    ],
    userId: {
      type: String,
    },
    folderId: {
      type: String,
    },
    adminId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tutSubFolder", tutFolderSchema);
