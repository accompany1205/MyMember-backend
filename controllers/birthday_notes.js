const birthdayNote = require("../models/birthday_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");
const memberModal = require("../models/addmember");

exports.create = (req, res) => {
  student.findById(req.params.studentId).exec((err, studetData) => {
    if (err) {
      res.send({ error: "student data not found" });
    } else {
      var obj = {
        firstName: studetData.firstName,
        lastName: studetData.lastName,
        userId: req.params.userId,
        notes: studetData.notes,
      };
      var birthday = new birthdayNote(req.body);
      birthdayObj = _.extend(birthday, obj);

      birthdayObj.save((err, note) => {
        if (err) {
          res.send({ error: "birthday notes is not create" });
        } else {
          student
            .findByIdAndUpdate(req.params.studentId, {
              $push: { birthday_notes: note._id },
            })
            .exec((err, birthdayStd) => {
              if (err) {
                res.send({ error: "birthday notes is not add in student" });
              } else {
                // res.send(note)
                user
                  .findByIdAndUpdate(req.params.userId, {
                    $push: { birthday_note_history: note._id },
                  })
                  .exec((err, birthdayUser) => {
                    if (err) {
                      res.send({
                        error: "birthday notes is not add in school",
                      });
                    } else {
                      res.send(note);
                    }
                  });
              }
            });
        }
      });
    }
  });
};

exports.remove = (req, res) => {
  var notesId = req.params.notesId;
  birthdayNote.findByIdAndRemove({ _id: notesId }, (err, removeNote) => {
    if (err) {
      res.send({ error: "notes is not delete" });
    } else {
      student
        .update(
          { birthday_notes: removeNote._id },
          { $pull: { birthday_notes: removeNote._id } }
        )
        .exec((err, noteUpdateStd) => {
          if (err) {
            res.send({ error: "notes is not remove in student" });
          } else {
            user
              .update(
                { birthday_note_history: removeNote._id },
                { $pull: { birthday_note_history: removeNote._id } }
              )
              .exec((err, noteUpdateUser) => {
                if (err) {
                  res.send({ error: "notes is not remove in school" });
                } else {
                  res.send({ msg: "notes is remove successfully" });
                }
              });
          }
        });
    }
  });
};

exports.updateNote = (req, res) => {
  var notesid = req.params.notesId;
  birthdayNote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
    if (err) {
      res.send({ error: "birthday notes is not update" });
    } else {
      res.send({ msg: "birthday notes update successfully" });
    }
  });
};

exports.birth_this_week = async (req, res) => {
  //     var cur = new Date()
  // try{
  // var data = await memberModal.find({$expr:{$eq:[{"$month":"$dob"},6]}})
  // res.send(data)
  // }catch(e){
  //     res.send(e)
  // }

  // var cur = new Date()
  // // { $expr: { $eq: [{ $month: '$DateT' }, { $month: curdat }] } },
  // memberModal.aggregate([
  //     {
  //         $match: {
  //             $and: [{ userId: req.params.userId },
  //             { $expr: { $eq: [{ "$month":'$dob' },{"$month":cur}] } }]
  //         }
  //     }, {
  //         $project: {
  //             firstName: 1,
  //             lastName: 1,
  //             memberprofileImage:1,
  //             dob: 1,
  //             age: 1,
  //             day_left: 1,
  //             primaryPhone: 1,
  //             rank: 1,
  //             day_left:1
  //         }
  //     }
  // ])
  // console.log(req.params.userId)

  memberModal.find({ userId: req.params.userId }).exec((err, resp) => {
    if (err) {
      res.json({ code: 400, msg: "this week birthday not found" });
    } else {
      res.json({ code: 200, msg: resp });
    }
  });
};

exports.seven_to_forteen = async (req, res) => {
  try {
    let todays = new Date();
    let userId = req.params.userId;

    let birthdayData = await student.aggregate([
      { $match: { userId: userId } },
      {
        $project: {
          firstName: 1,
          dob: 1,
          todayDayOfYear: { $dayOfYear: new Date() },
          leap: {
            $or: [
              { $eq: [0, { $mod: [{ $year: "$dob" }, 400] }] },
              {
                $and: [
                  { $eq: [0, { $mod: [{ $year: "$dob" }, 4] }] },
                  { $ne: [0, { $mod: [{ $year: "$dob" }, 100] }] },
                ],
              },
            ],
          },
          dayOfYear: { $dayOfYear: "$dob" },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          leap: 1,
          todayDayOfYear: 1,
          dayOfYear: {
            $subtract: [
              "$dayOfYear",
              {
                $cond: [{ $and: ["$leap", { $gt: ["$dayOfYear", 59] }] }, 1, 0],
              },
            ],
          },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          daysTillBirthday: {
            $subtract: [
              {
                $add: [
                  "$dayOfYear",
                  {
                    $cond: [{ $lt: ["$dayOfYear", "$todayDayOfYear"] }, 365, 0],
                  },
                ],
              },
              "$todayDayOfYear",
            ],
          },
        },
      },
      { $match: { daysTillBirthday: { $lt: 14 } } },
      { $sort: { daysTillBirthday: 1 } },
    ]);
    res.send(birthdayData);
  } catch (err) {
    throw new Error(err);
  }
};

exports.fifteen_to_thirty = async (req, res) => {
  try {
    let todays = new Date();
    let userId = req.params.userId;

    let birthdayData = await student.aggregate([
      { $match: { userId: userId } },
      {
        $project: {
          firstName: 1,
          dob: 1,
          todayDayOfYear: { $dayOfYear: new Date() },
          leap: {
            $or: [
              { $eq: [0, { $mod: [{ $year: "$dob" }, 400] }] },
              {
                $and: [
                  { $eq: [0, { $mod: [{ $year: "$dob" }, 4] }] },
                  { $ne: [0, { $mod: [{ $year: "$dob" }, 100] }] },
                ],
              },
            ],
          },
          dayOfYear: { $dayOfYear: "$dob" },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          leap: 1,
          todayDayOfYear: 1,
          dayOfYear: {
            $subtract: [
              "$dayOfYear",
              {
                $cond: [{ $and: ["$leap", { $gt: ["$dayOfYear", 59] }] }, 1, 0],
              },
            ],
          },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          daysTillBirthday: {
            $subtract: [
              {
                $add: [
                  "$dayOfYear",
                  {
                    $cond: [{ $lt: ["$dayOfYear", "$todayDayOfYear"] }, 365, 0],
                  },
                ],
              },
              "$todayDayOfYear",
            ],
          },
        },
      },
      { $match: { daysTillBirthday: { $lt: 30, $gt: 14 } } },
      { $sort: { daysTillBirthday: 1 } },
    ]);
    res.send(birthdayData);
  } catch (err) {
    throw new Error(err);
  }
};
exports.moreThirty = async (req, res) => {
  try {
    let todays = new Date();
    let userId = req.params.userId;

    let birthdayData = await student.aggregate([
      { $match: { userId: userId } },
      {
        $project: {
          firstName: 1,
          dob: 1,
          todayDayOfYear: { $dayOfYear: new Date() },
          leap: {
            $or: [
              { $eq: [0, { $mod: [{ $year: "$dob" }, 400] }] },
              {
                $and: [
                  { $eq: [0, { $mod: [{ $year: "$dob" }, 4] }] },
                  { $ne: [0, { $mod: [{ $year: "$dob" }, 100] }] },
                ],
              },
            ],
          },
          dayOfYear: { $dayOfYear: "$dob" },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          leap: 1,
          todayDayOfYear: 1,
          dayOfYear: {
            $subtract: [
              "$dayOfYear",
              {
                $cond: [{ $and: ["$leap", { $gt: ["$dayOfYear", 59] }] }, 1, 0],
              },
            ],
          },
        },
      },
      {
        $project: {
          firstName: 1,
          dob: 1,
          daysTillBirthday: {
            $subtract: [
              {
                $add: [
                  "$dayOfYear",
                  {
                    $cond: [{ $lt: ["$dayOfYear", "$todayDayOfYear"] }, 365, 0],
                  },
                ],
              },
              "$todayDayOfYear",
            ],
          },
        },
      },
      { $match: { daysTillBirthday: { $gt: 30 } } },
      { $sort: { daysTillBirthday: 1 } },
    ]);
    res.send(birthdayData);
  } catch (err) {
    throw new Error(err);
  }
};

exports.this_month = async (req, res) => {
  let todays = new Date();
  let userId = req.params.userId;
  try {
    const thisMonthBirthday = await student.aggregate([
      { $match: { userId: userId } },

      {
        $project: {
          firstName: 1,
          dob: 1,
          daysTillBirthday: {
            $subtract: [{ $dayOfMonth: "$dob" }, { $dayOfMonth: todays }],
          },
        },
      },
      {
        $match: {
          $expr: { $eq: [{ $month: "$dob" }, { $month: todays }] },
          daysTillBirthday: { $gt: 0 },
        },
      },
      { $sort: { daysTillBirthday: 1 } },
    ]);

    res.send({ data: thisMonthBirthday });
  } catch (er) {
    throw new Error(er);
  }
};

exports.next_month = async (req, res) => {
  let todays = new Date();
  let nextMonth = todays.getMonth() + 2;
  console.log(nextMonth);
  let userId = req.params.userId;
  try {
    const nextMonthBirthday = await student.aggregate([
      { $match: { userId: userId } },

      {
        $project: {
          firstName: 1,
          dob: 1,
          daysTillBirthday: {
            $add: [
              { $dayOfMonth: "$dob" },
              { $subtract: [30, { $dayOfMonth: todays }] },
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dob" }, { $add: [1, { $month: todays }] }],
          },
          daysTillBirthday: { $gt: 0 },
        },
      },
      { $sort: { daysTillBirthday: 1 } },
    ]);

    res.send({ data: nextMonthBirthday });
  } catch (er) {
    throw new Error(er);
  }
};
