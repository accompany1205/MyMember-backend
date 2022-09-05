const mongoose = require("mongoose");
const schema = mongoose.Schema;
const membershipFolderSchema = schema(
  {
    folderName: {
      type: String,
      unique: true,
      required: true,
    },
    membership: [
      {
        type: schema.Types.ObjectId,
        ref: "membership",
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

module.exports = mongoose.model("membershipFolder", membershipFolderSchema);
