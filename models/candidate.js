const mongoose = require("mongoose");
const schema = mongoose.Schema;
const stripeSchema = new schema(
  {
    candidate: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxlength: 32,
    },
    color: {
      type: String,
      required: true,
    },
    lable: {
      type: String,
      required: true,
    },
    total_stripe: {
      type: String,
      required: true,
    },
    progression: {
      type: String,
      required: true,
    },
    candidate_image: {
      type: String,
    },
    stripes: [
      {
        type: schema.Types.ObjectId,
      ref: "candidate_stripes",
      },
    ],
    userId: {
      type: String,
    },
    adminId: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("candidate", stripeSchema);
