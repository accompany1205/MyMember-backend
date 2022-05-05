const appointmetEvent = require("../models/appointment_category");
const _ = require("lodash");

exports.create = (req, res) => {
  const payload = req.body;
  payload.userId = req.params.userId;
  payload.adminId = req.params.adminId;
  const appointEvent = new appointmetEvent(payload);
  appointEvent.save((err, appdata) => {
    if (err) {
      res.send({ msg: "Appoinment is not created!", success: false });
    } else {
      res.send({
        success: true,
        msg: "Appointment event created successfully!",
        data: appdata,
      });
    }
  });
};

exports.update = (req, res) => {
  const id = req.params.docId;
  appointmetEvent
    .findByIdAndUpdate(id, { $set: req.body })
    .then(() => {
      res.send({
        msg: "Appointment has been updated successfully!",
        success: true,
      });
    })
    .catch((err) => {
      res.send({ msg: "Event not updated please try again!", success: false });
    });
};

exports.getAllEvents = async (req, res) => {
  let userId = req.params.userId
  await appointmetEvent
    .find({ $or: [{ userId: userId }, { adminId: { $exists: true } }] })
    .then((result) => {
      res.send({ success: true, data: result });
    })
    .catch((err) => {
      res.send({ success: false, data: [] });
    });
};

exports.deleteEvent = (req, res) => {
  const id = req.params.docId;
  appointmetEvent
    .deleteOne({ _id: id })
    .then((resp) => {
      res.send({
        msg: "Appointment has been deleted successfully!",
        success: true,
      });
    })
    .catch((err) => {
      res.send({ msg: "Event not deleted please try again!" });
    });
};
