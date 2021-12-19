const appoint = require("../models/appointment");
const _ = require("lodash");
// const todo = require("../models/todo_schema")

exports.Create = (req, res) => {
  var appoinemnt = req.body;
  var App = _.extend(appoinemnt, req.params);
  const campaigns = new appoint(App);
  campaigns.save((err, appdata) => {
    if (err) {
      res.send({ msg: "appoinment is not added", success:false });
    } else {
      res.send({success:true, msg:"apoointment added!", appdata});
    }
  });
};

exports.read = (req, res) => {
  appoint
    .find({ userId: req.params.userId })
    .then((result) => {
      res.send({success:true, msg:"Data!", result});
    })
    .catch((err) => {
      res.send({ msg: "No data!", success:false });
    });
};

exports.appointInfo = (req, res) => {
  const id = req.params.appointId;
  appoint
    .findById(id)
    .populate('studentInfo','firstName lastName primaryPhone studentType memberprofileImage status')
    .then((result) => {
      res.send({msg:"Data!", success:true, result});
    })
    .catch((err) => {
      res.send({ msg: "No data!", success:false });
    });
};

exports.update = (req, res) => {
  const id = req.params.appointId;
  appoint
    .findByIdAndUpdate(id, { $set: req.body })
    .then((update_resp) => {
      res.send({msg:"Appointment Updated successfuly", success:true, update_resp});
    })
    .catch((err) => {
      res.send({ msg: "Appointment Not updated!", success:false });
    });
};

exports.remove = (req, res) => {
  const id = req.params.appointId;
  appoint
    .deleteOne({ _id: id })
    .then((resp) => {
      res.send({msg:"appointment deleted successfuly", success:true});
    })
    .catch((err) => {
      res.send({msg:"appointment not deleted!", success:false});
    });
};
