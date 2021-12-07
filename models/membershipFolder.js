const mongoose = require("mongoose");
const schema = mongoose.Schema;
const membershipFolderSchema = schema(
  {
    folderName: {
      type: String,
      unique: true,
      require: true,
    },
    membership: [
      {
        type: schema.Types.ObjectId,
        ref: "membership",
      },
    ],
    userId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("membershipFolder", membershipFolderSchema);
