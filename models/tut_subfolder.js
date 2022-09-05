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
      index:true
    },
    folderId: {
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

module.exports = mongoose.model("tutSubFolder", tutFolderSchema);
