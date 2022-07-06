const candidateModal = require("../models/candidate");
const User = require("../models/user");
const member = require("../models/addmember");
const cloudUrl = require("../gcloud/imageUrl");
const { env } = require("process");

exports.candidate_create = async (req, res) => {
  try {
    const candidateBody = req.body;
    candidateBody.userId = req.params.userId;
    candidateBody.adminId = req.params.adminId;
    if (req.file) {
      await cloudUrl
        .imageUrl(req.file)
        .then((expimgUrl) => {
          candidateBody.candidate_image = expimgUrl;
        })
        .catch((error) => {
          res.send({ msg: "candidate image url  not created", success: false });
        });
    }
    const stripeObj = new candidateModal(candidateBody);
    stripeObj.save((err, data) => {
      if (err) {
        return res.status(400).send({
          msg: err.message.replace(/\"/g, ""),
          success: false,
        });
      } else {
        res.send({ msg: "Candidate created successfully", success: true });
      }
    });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.candidate_read = (req, res) => {
  const adminId = process.env.ADMINID;
  const userId = req.params.userId;
  try {
    candidateModal
      .find({ $or: [{ userId: userId }, { adminId: { $exists: true } }] })
      .populate("stripes")
      .then((stripe) => {
        if (stripe.length > 0) {
          res.send({ data: stripe, success: true });
        } else {
          res.send({ msg: "candidate is empty", success: false });
        }
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.candidate_readAdmin = (req, res) => {
  const adminId = req.params.adminId;
  try {
    candidateModal
      .find({ adminId: adminId })
      .populate("stripes")
      .then((stripe) => {
        if (stripe.length > 0) {
          res.send({ data: stripe, success: true });
        } else {
          res.send({ msg: "candidate is empty", success: false });
        }
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.candidate_update = async (req, res) => {
  try {
    const candidateBody = req.body;
    const candidateId = req.params.candidateId;
    const adminId = req.params.adminId;
    const userId = req.params.userId;
    if (req.file) {
      await cloudUrl
        .imageUrl(req.file)
        .then((expimgUrl) => {
          candidateBody.candidate_image = expimgUrl;
        })
        .catch((error) => {
          res.send({ msg: "candidate image url not created", success: false });
        });
    }
    candidateModal
      .updateOne(
        { _id: candidateId, $and: [{ userId: userId }, { adminId: adminId }] },
        { $set: candidateBody }
      )
      .exec(async (err, updateData) => {
        if (err) {
          res.send({ msg: "candidate already exist!", success: err });
        } else {
          if (updateData.n < 1) {
            return res.send({
              msg: "This is system generated membership Only admin can update",
              success: false,
            });
          }
          res.send({
            msg: "candidate updated successfully",
            success: true,
          });
        }
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.candidate_detail = (req, res) => {
  try {
    const id = req.params.candidateId;
    candidateModal
      .findById(id)
      .select("candidate")
      .populate("stripes")
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.candidate_remove = async (req, res) => {
  try {
    var candidateId = req.params.candidateId;
    const adminId = req.params.adminId;
    const userId = req.params.userId;
    candidateModal
      .findOneAndRemove({
        _id: candidateId,
        $and: [{ userId: userId }, { adminId: adminId }],
      })
      .exec((err, data) => {
        if (err) {
          res.send({ msg: "Candidate  not removed", success: false });
        } else {
          if (!data) {
            return res.send({
              msg: "This is system generated membership Only admin can delete",
              success: false,
            });
          }
          res.send({
            msg: "Candidate removed  successfully",
            success: true,
          });
        }
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.getStripeReportByCandidate = async (req, res) => {
  try {
    let { candidateName, studentType } = req.query;
    const userId = req.params.userId;
    if (candidateName === "") {
      return res.json([]);
    }
    const filter =
      userId && candidateName && studentType
        ? {
            userId: userId,
            candidate: candidateName,
            studentType: studentType,
          }
        : {
            userId: userId,
            candidate: candidateName,
          };
    const stripes = await candidateModal.aggregate([
      {
        $match: {
          candidate: candidateName,
        },
      },
      { $unwind: "$stripes" },
      {
        $lookup: {
          from: "candidate_stripes",
          localField: "stripes",
          foreignField: "_id",
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      {
        $project: {
          candidate: 1,
          stripe_name: "$candidate.stripe_name",
          stripe_image: "$candidate.stripe_image",
          stripe_order: { $toInt: "$candidate.stripe_order" },
        },
      },
      // Get Current Month Data
      {
        $lookup: {
          from: "members",
          localField: "stripe_name",
          foreignField: "current_stripe",
          as: "total-students",
          pipeline: [
            {
              $match: filter,
            },

            {
              $count: "total",
            },
          ],
        },
      },

      // Lets Map the Data
      {
        $project: {
          candidate: 1,
          stripe_name: 1,
          stripe_image: 1,
          stripe_order: 1,
          total_students: { $sum: "$total-students.total" },
        },
      },
      { $sort: { stripe_order: 1 } },
      // {
      // 	$project: {

      // 		total: 1

      // 	}
      // }
    ]);

    //

    return res.json(stripes);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Data not Found" });
  }
};

exports.join_notjoin = async (req, res) => {
  var candidateInfo = await candidateModal.findOne({
    _id: req.params.candidateId,
  });
  var c_stripe_name = candidateInfo.current_stripe;
  var c_split_stripe = c_stripe_name.split("#");
  var update_stripe = c_split_stripe[0] + "#" + req.body.status;
  if (req.body.status == "Join") {
    var updateStd = await candidateModal.updateOne(
      { _id: req.params.candidateId },
      { $set: { current_stripe: update_stripe } }
    );
    if (updateStd) {
      await candidateModal.updateOne(
        { _id: req.params.candidateId },
        { $set: { current_stripe: update_stripe } }
      );
      res.send({ msg: "candidate stripe is join" });
    } else {
      res.send({ error: "candidate stripe not update" });
    }
  } else if (req.body.status == "Not Join") {
    var updateStd = await candidateModal.updateOne(
      { _id: req.params.candidateId },
      { $set: { current_stripe: update_stripe } }
    );
    if (updateStd) {
      await candidateModal.updateOne(
        { _id: req.params.candidateId },
        { $set: { current_stripe: update_stripe } }
      );
      res.send({ msg: "candidate stripe is not join" });
    } else {
      res.send({ error: "candidate stripe not update" });
    }
  }
};

exports.stripe_report = async (req, res) => {
  var sCount = await candidateModal
    .find({
      $and: [
        { userId: req.params.userId },
        { candidate_status: req.body.stName },
      ],
    })
    .count();
  var sDetails = await candidateModal.find({
    $and: [
      { userId: req.params.userId },
      { candidate_status: req.body.stName },
    ],
  });
  res.send({ student_count: sCount, student_details: sDetails });
};

exports.promote_stripe = (req, res) => {
  var cStripe = req.body.current_stripe;
  var stripe_split = cStripe.split("#");
  var no_stripe = stripe_split[1];
  var change_no = parseInt(no_stripe) + 1;
  var n_change_no = parseInt(no_stripe) + 2;
  var update_cur_stripe = stripe_split[0] + "#" + `${change_no.toString()}`;
  var next_cur_stripe = stripe_split[0] + "#" + `${n_change_no.toString()}`;

  candidateModal
    .findByIdAndUpdate(
      { _id: req.params.candidateId },
      {
        $set: {
          current_stripe: update_cur_stripe,
          next_stripe: next_cur_stripe,
        },
      }
    )
    .exec(async (err, promote) => {
      if (err) {
        res.send({ error: "stripe is not promote" });
      } else {
        var can = await candidateModal.findByIdAndUpdate(
          { _id: req.params.candidateId },
          {
            $set: {
              current_stripe: update_cur_stripe,
              next_stripe: next_cur_stripe,
            },
          }
        );
        if (can) {
          var stripe = next_cur_stripe;
          var s_stripe = stripe.split("#");
          var c_std_stripe = s_stripe[1];
          var lastdateStripe = TimeZone();
          await member.updateOne(
            { _id: can.stdId },
            {
              $set: {
                current_stripe: c_std_stripe,
                last_stripe_given_date: lastdateStripe.Date,
              },
            }
          );
          res.send({ msg: "candidate and stripe promote both" });
        } else {
          res.send({ error: "stripe not promote candidate" });
        }
      }
    });
};
