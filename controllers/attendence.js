const student = require("../models/addmember");
const schedule = require("../models/class_schedule");
var mongo = require("mongoose")

function TimeZone() {
  const str = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const date_time = str.split(",");
  const date = date_time[0];
  const time = date_time[1];
  return { Date: date, Time: time };
}

exports.search_std = (req, res) => {
  try {
    var regex = new RegExp("^" + req.body.search, "i");
    student
      .find(
        { $and: [{ userId: req.params.userId }, { firstName: regex }] },
        { firstName: 1, lastName: 1, age: 1, studentType: 1 }
      )
      .exec((err, resp) => {
        if (err) {
          res.json({ code: 400, msg: "list not found" });
        } else {
          res.send({ code: 200, msg: resp });
        }
      });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.create = async (req, res) => {
  try {
    const studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)
    let time = req.body.time

    var schdule_data = await schedule.findOne({ _id: req.params.scheduleId, "class_attendanceArray.studentInfo": { $nin: [objId] } });
    if (schdule_data) {
      student.findOne({ _id: studentId }).exec((err, stdData) => {
        if (err || stdData == null) {
          res.send({ msg: "student data not find", success: false });
        } else {
          console.log(stdData)
          var DT = TimeZone();
          let h = parseInt(time.split(':')[0])
          let m = parseInt(time.split(':')[1])
          var DT = TimeZone();
          let epochTime = new Date()
          // epochTime.setHours(h, m)
          var class_attendanceArray = {
            studentInfo: objId,
            time: time,
            date: DT.Date,
            epochTime: epochTime
          };
          schedule.updateOne({ _id: req.params.scheduleId, "class_attendanceArray.studentInfo": { $nin: [objId] } },
            { $addToSet: { class_attendanceArray: class_attendanceArray } })
            .exec((err, attendanceUpdte) => {
              if (err) {
                res.send({ msg: err, success: false });
              } else {
                student.updateOne({ _id: studentId },
                  {
                    $set: {
                      rating: 0,
                      missclass_count: 0,
                      attendence_color: "#00FF00",
                      attendence_status: true,
                    },
                    $inc: {
                      attendedclass_count: 1,
                    }
                  }
                )
                  .exec((err, data) => {
                    if (err) {
                      res.send({ msg: "student rating is not update", success: false });

                    } else {
                      res.send({
                        msg: "student attendence marked successfully",
                        success: true
                      });
                    }
                  });
              }
            });
        }

      })
    } else {
      res.send({
        msg: "attendence marked already",
        success: true
      });
    }
  }
  catch (err) {
    throw new Error(err)
  }
};

exports.update = async (req, res) => {
  try {
    const studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)
    let time = req.body.time
    let h = parseInt(time.split(':')[0])
    let m = parseInt(time.split(':')[1])
    var DT = TimeZone();
    let epochTime = new Date()
    // epochTime.setHours(h, m)

    var class_attendanceArray = {
      studentInfo: objId,
      time: time,
      date: DT.Date,
      epochTime: epochTime
    };
    schedule.updateOne({
      _id: req.params.scheduleId,
      "class_attendanceArray.studentInfo": objId
    },
      { $set: { class_attendanceArray: class_attendanceArray } })
      .exec((err, data) => {
        if (err) {
          res.send({ msg: "student rating is not update" });

        } else {
          res.send({
            msg: "student rating is update",
            attendanceData: data,
          });
        }
      });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.remove = (req, res) => {
  try {
    let userId = req.params.userId
    let studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)

    let scheduleId = req.params.scheduleId

    schedule.updateOne(
      { _id: scheduleId, },
      { $pull: { "class_attendanceArray": { studentInfo: objId } } },
      (err, attendeRemove) => {
        if (err) {
          res.send({ msg: "student attendance is not remove in class" });
        } else {
          res.send({
            msg: "student attendance is remove successfully",
            success: true,
          });
        }
      }
    );
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }

};

exports.list_attendence = (req, res) => {
  try {
    const userId = req.params.userId
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    schedule.
      aggregate([
        { $match: { userId: userId } },
        {
          $sort: {
            updatedAt: -1,
          }
        },
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            start_time: 1,
            end_time: 1,
            end_date: 1,
            createdAt: 1,
            program_color: 1,
            class_attendanceArray: 1,

          }
        },
        {
          $lookup: {
            from: "members",
            localField: "class_attendanceArray.studentInfo",
            foreignField: "_id",
            as: "data"
          }
        },
        // {
        //   $unwind: "$data"
        // }
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            start_time: 1,
            end_time: 1,
            createdAt: 1,
            end_date: 1,
            program_color: 1,
            class_attendanceArray: 1,
            "data.firstName": 1,
            "data.lastName": 1,
            "data.notes": 1,
            "data.primaryPhone": 1,
            "data.memberprofileImage": 1,
            "data._id": 1
          }
        },
        {
          "$addFields": {
            "attendence": {
              "$map": {
                "input": "$class_attendanceArray",
                "in": {
                  "$mergeObjects": [
                    "$$this",
                    {
                      "$arrayElemAt": [
                        "$data",
                        { "$indexOfArray": ["$data._id", "$$this.studentInfo"] }
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        { $project: { data: 0, class_attendanceArray: 0 } },

        // {
        //   $group: {
        //     _id: "$studentId",
        //     attendedclass_count: { $sum: 1 },
        //     class_name: { "$first": "$class_name" },
        //     // attendence: { "$push": { firstName: '$data.firstName', lastName: '$data.lastName', image: "$data.memberprofileImage" } },
        //     firstName: { "$first": '$firstName' },
        //     // program: { "$first": '$data.program' },
        //     // notes: { "$first": '$data.notes' },
        //   }
        // }
        {
          $facet: {
            paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
            totalCount: [
              {
                $count: 'count'
              }
            ]
          }
        }
      ])
      .exec((err, list) => {
        if (err) {
          res.send({ msg: "attendence list not found" });
        } else {
          let data = list[0].paginatedResults
          if (data.length > 0) {
            res.send({ data: data, totalCount: list[0].totalCount[0].count, success: true });

          } else {
            res.send({ msg: 'data not found', success: false });
          }
        }
      });
  }

  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });

  }
}


exports.getStudentAttendence = (req, res) => {
  try {
    let userId = req.params.userId

    let studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    schedule.aggregate([
      { $match: { userId: userId, "class_attendanceArray.studentInfo": objId } },

      {
        $project: {
          program_name: 1,
          class_name: 1,
          start_date: 1,
          end_date: 1,
          program_color: 1,
          class_attendanceArray: {
            $arrayElemAt: [{
              $filter: {
                input: "$class_attendanceArray",
                as: "item",
                cond: { $eq: ["$$item.studentInfo", objId] }
              },
            }, 0]
          }
        }
      }
      , {
        $lookup: {
          from: "members",
          localField: "class_attendanceArray.studentInfo",
          foreignField: "_id",
          as: "data"
        }
      },
      {
        $unwind: "$data"
      },
      {
        $project: {
          program_name: 1,
          class_name: 1,
          start_date: 1,
          end_date: 1,
          program_color: 1,
          class_attendanceArray: 1,
          "data.firstName": 1,
          "data.lastName": 1,
          "data.memberprofileImage": 1,
          "data._id": 1
        }
      },

      {
        "$addFields": {
          "attendence": {
            $mergeObjects: [
              "$class_attendanceArray",
              "$data"
            ]
          }
        }
      },
      { $project: { data: 0, class_attendanceArray: 0 } },
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $facet: {
          paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }

    ])
      .exec((err, list) => {
        if (err) {
          res.send({ msg: "attendence list not found" });
        } else {
          let data = list[0].paginatedResults
          if (data.length > 0) {
            res.send({ data: data, totalCount: list[0].totalCount[0].count, success: true });

          } else {
            res.send({ msg: 'data not found', success: false });
          }
        }
      })
  }

  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }

};

exports.searchAttendance = async (req, res) => {
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const search = req.query.search;
  const userId = req.params.userId;
  const filter = req.body.filter;
  let startDate = req.body.start_date;
  let endDate = req.body.end_date;
  let date = new Date();
  try {
    if (search) {
      const totalCount = await schedule.find({
        $and: [
          { userId: userId },
          {
            $or: [
              { program_name: { $regex: search, '$options': 'i' } },
              { class_name: { $regex: search, '$options': 'i' } }]
          }
        ]
      }).countDocuments();

      schedule.find({
        $and: [
          { userId: userId },
          {
            $or: [
              { program_name: { $regex: search, '$options': 'i' } },
              { class_name: { $regex: search, '$options': 'i' } }]
          }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, msg: 'Searched attendance', result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (filter === "Today") {
      let cDate = ("0" + (date.getDate())).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cMonth}/${cDate}/${cYear}`;
      const totalCount = await schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).countDocuments();

      schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (filter === "Tomorrow") {
      let cDate = ("0" + (date.getDate() + 1)).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cMonth}/${cDate}/${cYear}`;
      const totalCount = await schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).countDocuments();

      schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (filter === "Yesterday") {
      let cDate = ("0" + (date.getDate() - 1)).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cMonth}/${cDate}/${cYear}`;
      const totalCount = await schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).countDocuments();

      schedule.find({
        $and: [
          { userId: userId },
          { start_date: currentDate }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (startDate && endDate) {
      const totalCount = await schedule.find({
        $and: [
          { userId: userId },
          { start_date: { $gte: (startDate), $lt: (endDate) } }
        ]
      }).countDocuments();

      schedule.find({
        $and: [
          { userId: userId },
          { start_date: { $gte: (startDate), $lt: (endDate) } }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, msg: 'filtered attendance', result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    }
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

// exports.getStudentAttendence = async (req, res) => {
//   let studentId = req.params.studentId
//   if (!studentId) {
//     res.json({ status: false, msg: "Student id  not found in params" });
//   }
//   let attendance = attendance.find({ studentId: studentId })
//   if (!attendance) {
//     res.json({ status: false, msg: `Attendance data not found with this Student id  ${studentId}` });
//   }

//   res.json({ status: true, data: attendance })
// }
exports.update_rating = async (req, res) => {
  const pipeline = [
    {
      '$match': {
        'userId': '606aea95a145ea2d26e0f1ab'
      }
    }, {
      '$lookup': {
        'from': 'class_schedules',
        'localField': '_id',
        'foreignField': 'class_attendanceArray.studentInfo',
        'as': 'data'
      }
    }, {
      '$project': {
        'last_attended_date': {
          '$toDate': {
            '$arrayElemAt': [
              '$data.start_date', -1
            ]
          }
        }
      }
    }, {
      '$addFields': {
        'rating': {
          '$floor': {
            '$divide': [
              {
                '$subtract': [
                  new Date(), '$last_attended_date'
                ]
              }, 1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]
  const members = await student.aggregate(pipeline)
  const promise = await members.map(member => {
    student.findOneAndUpdate({ _id: member._id }, { $set: { rating: (member.rating == null ? 60 : member.rating) } }, { $upsert: true })

  })
  Promise.all(promise).then(resp => {
    res.send({ msg: 'updated' })

  }).catch(err => {

  })
}