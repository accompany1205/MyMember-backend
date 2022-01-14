const appointmetEvent = require("../models/appointment_category");
const _ = require("lodash");

exports.create = (req, res) => {
  const payload = req.body;
  const App = _.extend(payload, req.params);
  const appointEvent = new appointmetEvent(App);
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
  let userId = req.params.userId;
  var totalCount = await appointmetEvent
    .find({
      userId: req.params.userId,
    })
    .countDocuments();

  var per_page = parseInt(req.params.per_page) || 10;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  await appointmetEvent
    .find({ userId })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .then((result) => {
      res.send({ success: true, totalCount: totalCount, data: result });
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
