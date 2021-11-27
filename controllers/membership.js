const membershipModal = require("../models/membership");
const membershipFolder = require("../models/membershipFolder");

// const cloudinary = require("cloudinary").v2
const cloudUrl = require("../gcloud/imageUrl");

exports.create = async (req, res) => {
  try {
    const membershipDetails = await req.body;
    membershipDetails.userId = req.params.userId;
    membershipDetails.folderId = req.params.folderId;
    const membershipObj = new membershipModal(membershipDetails);
    await membershipObj.save((err, data) => {
      if (err) {
        res.send({ msg: "membership not created", success: false });
      } else {
        membershipFolder.findByIdAndUpdate(
          req.params.folderId,
          {
            $push: { membership: data._id },
          },
          (err, data) => {
            if (err) {
              res.send({
                msg: "membership not addd in folder",
                success: false,
              });
            } else {
              res.send({ msg: "membership created", success: true });
            }
          }
        );
      }
    });
    // let obj = await membershipModal.findByIdAndUpdate({ _id: membershipObj._id }, { $set: { userId: userId } })
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

exports.read = (req, res) => {
  membershipModal.find({ userId: req.params.userId }).exec((err, data) => {
    if (err) {
      res.send({ error: "membership list is not find" });
    } else {
      res.send(data);
      // if(data.length>0){
      //     res.send(data);
      // }
      // else{
      //     res.send({msg:'membership list is empty'})
      // }
    }
  });
};

exports.membershipInfo = (req, res) => {
  var membershipId = req.params.membershipId;
  membershipModal.findById(membershipId).exec((err, data) => {
    if (err) {
      res.send({ error: "membership data not found" });
    } else {
      res.send(data);
    }
  });
};

exports.remove = (req, res) => {
  var membershipId = req.params.membershipId;
  membershipModal.findByIdAndDelete(membershipId, (err, data) => {
    if (err) {
      res.send({ error: "membership is not delete" });
    } else {
      res.send({ error: "membership is delete successfully" });
    }
  });
};

exports.membershipUpdate = (req, res) => {
  var membershipId = req.params.membershipId;

  membershipModal
    .updateOne({ _id: membershipId }, req.body)
    .exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ message: "membership updated successfully", success: true });
      }
    });
};
