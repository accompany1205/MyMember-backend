const { env } = require("process");
const stripe = require("../models/candidate_stripe");
const candidate = require("../models/candidate");
const cloudUrl = require("../gcloud/imageUrl");

exports.create = async (req, res) => {
  const stripeBody = req.body;
  stripeBody.userId = req.params.userId;
  stripeBody.adminId = req.params.adminId;
  let isExist = await candidate.find({
    candidate: stripeBody.candidate,
  });
  try {
    if (isExist.length) {
      if (req.file) {
        await cloudUrl
          .imageUrl(req.file)
          .then((expimgUrl) => {
            stripeBody.stripe_image = expimgUrl;
          })
          .catch((error) => {
            res.send({ msg: "Stripe image url not created", success: false });
          });
      }
      const managestripe = new stripe(stripeBody);
      managestripe.save((err, data) => {
        if (err) {
          res.send({ error: "manage stripe is not add" });
        } else {
          candidate
            .updateOne(
              { candidate: req.body.candidate },
              { $push: { stripes: data._id } }
            )
            .exec((err, stripe_data) => {
              if (err) {
                res.send({ msg: err, success: false });
              } else {
                res.send({ msg: "stripe  added successfully", success: true });
              }
            });
        }
      });
    } else {
      res.send({ msg: "Candidate does not exist!", success: false });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.update = async (req, res) => {
  const stripeId = req.params.stripeId;
  const adminId = req.params.adminId;
  const userId = req.params.userId;
  const stripeBody = req.body;
  let isExist = await candidate.find({
    candidate: stripeBody.candidate,
  });

  try {
    if (isExist.length) {
      if (req.file) {
        await cloudUrl
          .imageUrl(req.file)
          .then((expimgUrl) => {
            stripeBody.stripe_image = expimgUrl;
          })
          .catch((err) => {
            res.send({ msg: err.message.replace(/\"/g, ""), success: false });
          });

        await stripe
          .updatedOne(
            { _id: stripeId, $and: [{ userId: userId }, { adminId: adminId }] },
            { $set: stripeBody }
          )
          .exec((err, updateStripe) => {
            if (err) {
              res.send({ msg: err.message.replace(/\"/g, ""), success: false });
            } else {
              if (updateStripe.n < 1) {
                return res.send({
                  msg: "This is system generated Stripe Only admin can update",
                  success: false,
                });
              }
              res.send({ msg: "stripe updated successfully", success: true });
            }
          });
      } else {
        res.send({ msg: "Candidate does not exist!", success: false });
      }
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
exports.manage_stripe_detail = (req, res) => {
  try {
    const stripeId = req.params.stripeId;
    stripe
      .findById(stripeId)
      .then((result) => {
        res.send({ result, success: true });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.remove = async (req, res) => {
  try {
    const stripeId = req.params.stripeId;
    const adminId = req.params.adminId;
    const userId = req.params.userId;
    stripe.remove(
      { _id: stripeId, $and: [{ userId: userId }, { adminId: adminId }] },
      async (err, data) => {
        if (err) {
          res.send({ msg: "manage stripe is not delete", success: false });
        } else {
          if (!data) {
            return res.send({
              msg: "This is system generated Stipe Only admin can delete",
              success: false,
            });
          }
          await candidate.updateOne(
            { stripes: stripeId },
            { $pull: { stripes: stripeId } },
            function (err, data) {
              if (err) {
                res.send({ msg: "stripe not removed", success: false });
              } else {
                res.send({ msg: "stripe removed successfully", success: true });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};
