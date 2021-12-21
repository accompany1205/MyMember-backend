const appoint = require("../models/appointment");
const _ = require("lodash");
// const todo = require("../models/todo_schema")

exports.Create = (req, res) => {
  var appoinemnt = req.body;
  var App = _.extend(appoinemnt, req.params);
  const campaigns = new appoint(App);
  campaigns.save((err, appdata) => {
    if (err) {
      res.send({ msg: "appoinment is not added", success: false });
    } else {
      res.send({ success: true, msg: "apoointment added!", appdata });
    }
  });
};

exports.read = (req, res) => {
  appoint
    .find({ userId: req.params.userId })
    .then((result) => {
      res.send({ success: true, msg: "Data!", result });
    })
    .catch((err) => {
      res.send({ msg: "No data!", success: false });
    });
};

exports.appointInfo = (req, res) => {
  const id = req.params.appointId;
  appoint
    .findById(id)
    .populate('studentInfo', 'firstName lastName primaryPhone studentType memberprofileImage status')
    .then((result) => {
      res.send({ msg: "Data!", success: true, result });
    })
    .catch((err) => {
      res.send({ msg: "No data!", success: false });
    });
};

exports.update = (req, res) => {
  const id = req.params.appointId;
  appoint
    .findByIdAndUpdate(id, { $set: req.body })
    .then((update_resp) => {
      res.send({ msg: "Appointment Updated successfuly", success: true, update_resp });
    })
    .catch((err) => {
      res.send({ msg: "Appointment Not updated!", success: false });
    });
};

exports.appointmentFilter = async (req, res) => {
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const filter = req.body.filter;
  const userId = req.params.userId;
  let date = new Date();

  if (filter === "Today") {
    let cDate = ("0" + (date.getDate())).slice(-2);
    let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let cYear = date.getFullYear();
    let currentDate = `${cMonth}/${cDate}/${cYear}`;
    const totalCount = await appoint.find({
      $and: [
        { userId: userId },
        { start: currentDate }
      ]
    }).countDocuments();

    appoint.find({
      $and: [
        { userId: userId },
        { start: currentDate }
      ]
    }).limit(pagination.limit)
      .skip(pagination.skip)
      .then((result) => {
        res.send({ success: true, msg: 'filtered Appoitment', result, totalCount: totalCount })
      }).catch((err) => {
        res.send(err)
      })
  }else if (filter === "Tomorrow") {
    let cDate = ("0" + (date.getDate() + 1)).slice(-2);
    let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let cYear = date.getFullYear();
    let currentDate = `${cMonth}/${cDate}/${cYear}`;
    const totalCount = await appoint.find({
      $and: [
        { userId: userId },
        { start: currentDate }
      ]
    }).countDocuments();

    appoint.find({
      $and: [
        { userId: userId },
        { start: currentDate }
      ]
    }).limit(pagination.limit)
      .skip(pagination.skip)
      .then((result) => {
        res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
      }).catch((err) => {
        res.send(err)
      })
  }else if (filter === "This Week") {
    let cDate = ("0" + (date.getDate())).slice(-2);
    console.log("ddfdfdf--", cDate)
    let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let weekday = ("0" + (date.getDate()) * 7).slice(-2);
    console.log(weekday)
    let cYear = date.getFullYear();
    let week = `${cMonth}/${weekday}/${cYear}`;
    let currentDate = `${cMonth}/${cDate}/${cYear}`;
    const totalCount = await appoint.find({
      $and: [
        { userId: userId },
        { start:{ $gte: (currentDate), $lt: (week) } }
      ]
    }).countDocuments();

    appoint.find({
      $and: [
        { userId: userId },
        {start:{ $gte: (currentDate), $lt: (week) } }
      ]
    }).limit(pagination.limit)
      .skip(pagination.skip)
      .then((result) => {
        res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
      }).catch((err) => {
        res.send(err)
      })
  }else if (filter === "This Month") {
    let cDate = ("0" + (date.getDate())).slice(-2);
    let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let monthDay = ("0" + (date.getDate())).slice(-2);
    let monthMon = ("0" + (date.getMonth() + 3)).slice(-2);
    console.log(monthMon)
    let cYear = date.getFullYear();
    let month = `${monthMon}/${monthDay}/${cYear}`;
    let currentDate = `${cMonth}/${cDate}/${cYear}`;
    const totalCount = await appoint.find({
      $and: [
        { userId: userId },
        { start:{ $gte: (currentDate), $lt: (month) } }
      ]
    }).countDocuments();

    appoint.find({
      $and: [
        { userId: userId },
        {start:{ $gte: (currentDate), $lt: (month) } }
      ]
    }).limit(pagination.limit)
      .skip(pagination.skip)
      .then((result) => {
        res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
      }).catch((err) => {
        res.send(err)
      })
  }
};

exports.remove = (req, res) => {
  const id = req.params.appointId;
  appoint
    .deleteOne({ _id: id })
    .then((resp) => {
      res.send({ msg: "appointment deleted successfuly", success: true });
    })
    .catch((err) => {
      res.send({ msg: "appointment not deleted!", success: false });
    });
};
