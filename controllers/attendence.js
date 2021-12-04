const student = require("../models/addmember");
const schedule = require("../models/class_schedule");
const attendance = require("../models/attendence");
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
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.create = async (req, res) => {
  try {
    const studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)
    let time = req.body.time

    var schdule_data = await schedule.findOne({ _id: req.params.scheduleId });
    if (schdule_data) {
      student.findOne({ _id: studentId }).exec((err, stdData) => {
        if (err) {
          res.send({ error: "student data not find" });
        } else {
          var DT = TimeZone();
          let h = parseInt(time.split(':')[0])
          let m = parseInt(time.split(':')[1])
          var DT = TimeZone();
          let epochTime = new Date(DT.Date)
          epochTime.setHours(h, m)

          var class_attendanceArray = {
            studentInfo: objId,
            time: time,
            date: DT.Date,
            epochTime: epochTime.toISOString()
          };
          schedule.updateOne({ _id: req.params.scheduleId, "class_attendanceArray.studentInfo": { $nin: [objId] } },
            { $addToSet: { class_attendanceArray: class_attendanceArray } })
            .exec((err, attendanceUpdte) => {
              if (err) {
                res.send({ error: "student addendance is not add in class", Error: err });
              } else {
                student.updateOne({ _id: studentId },
                  {
                    $set: {
                      rating: 0,
                      class_count: stdData.class_count + 1,
                      attendence_color: "#00FF00",
                      attendence_status: true,
                    },
                  }
                )
                  .exec((err, data) => {
                    if (err) {
                      res.send({ error: "student rating is not update" });

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
    let epochTime = new Date(DT.Date)
    epochTime.setHours(h, m)

    var class_attendanceArray = {
      studentInfo: objId,
      time: time,
      date: DT.Date,
      epochTime: epochTime.toISOString()
    };
    schedule.updateOne({
      _id: req.params.scheduleId,
      "class_attendanceArray.studentInfo": objId
    },
      { $set: { class_attendanceArray: class_attendanceArray } })
      .exec((err, data) => {
        if (err) {
          res.send({ error: "student rating is not update" });

        } else {
          res.send({
            msg: "student rating is update",
            attendanceData: data,
          });
        }
      });
  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
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
          res.send({ error: "student attendance is not remove in class" });
        } else {
          res.send({
            msg: "student attendance is remove successfully",
            result: attendeRemove,
          });
        }
      }
    );
  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }

};

exports.list_attendence = (req, res) => {
  try {
    const userId = req.params.userId

    schedule.
      aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            end_date: 1,
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
        { $project: { data: 0, class_attendanceArray: 0 } }
        // {
        //   $group: {
        //     _id: "$studentId",
        //     class_count: { $sum: 1 },
        //     class_name: { "$first": "$class_name" },
        //     // attendence: { "$push": { firstName: '$data.firstName', lastName: '$data.lastName', image: "$data.memberprofileImage" } },
        //     firstName: { "$first": '$firstName' },
        //     // program: { "$first": '$data.program' },
        //     // notes: { "$first": '$data.notes' },
        //   }
        // }

      ])
      .exec((err, list) => {
        if (err) {
          res.send({ error: "attendence list not found" });
        } else {
          res.send(list);
        }
      });
  }

  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });

  }
}


exports.getStudentAttendence = (req, res) => {
  try {
    let userId = req.params.userId

    let studentId = req.params.studentId
    var objId = mongo.Types.ObjectId(studentId)

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
      { $project: { data: 0, class_attendanceArray: 0 } }

      // {
      //   "$addFields": {
      //     "attendence": {
      //       "$map": {
      //         "input": "$class_attendanceArray",
      //         "in": {
      //           "$mergeObjects": [
      //             "$$this",
      //             {
      //               "$arrayElemAt": [
      //                 "$data",
      //                 { "$indexOfArray": ["$data._id", "$$this.studentInfo"] }
      //               ]
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   }
      // },

      // {
      //   $project: {
      //     program_name: 1,
      //     class_name: 1,
      //     start_date: 1,
      //     end_date: 1,
      //     program_color: 1,
      //     class_attendanceArray: 1,

      //   }
      // },
      // {
      //   $lookup: {
      //     from: "members",
      //     localField: "class_attendanceArray.studentInfo",
      //     foreignField: "_id",
      //     as: "data"
      //   }
      // },
      // {
      //   $unwind: "$data"
      // }
      // {
      //   $match: {
      //     $expr: { $eq: ["data.studentInfo", objId] },
      //   }
      // },
      // {
      //   $project: {
      //     program_name: 1,
      //     class_name: 1,
      //     start_date: 1,
      //     end_date: 1,
      //     program_color: 1,
      //     class_attendanceArray: 1,
      //     "data.firstName": 1,
      //     "data.lastName": 1,
      //     "data.memberprofileImage": 1,
      //     "data._id": 1
      //   }
      // },
      // {
      //   "$addFields": {
      //     "attendence": {
      //       "$map": {
      //         "input": "$class_attendanceArray",
      //         "in": {
      //           "$mergeObjects": [
      //             "$$this",
      //             {
      //               "$arrayElemAt": [
      //                 "$data",
      //                 { "$indexOfArray": ["$data._id", "$$this.studentInfo"] }
      //               ]
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   }
      // },
      // { $project: { data: 0, class_attendanceArray: 0 } },
      // {
      //   $match: {
      //     $expr: { $eq: ["attendence.studentInfo", objId] },
      //   }
      // },      // {
      //   $group: {
      //     _id: "$_id",
      //     class_count: { $sum: 1 },
      //     class_name: { "$first": "$class_name" },
      //     // attendence: { "$push": { firstName: '$data.firstName', lastName: '$data.lastName', image: "$data.memberprofileImage" } },
      //     firstName: { "$first": '$firstName' },
      //     // program: { "$first": '$data.program' },
      //     // notes: { "$first": '$data.notes' },
      //   }
      // }

    ])
      .exec((err, list) => {
        if (err) {
          res.send({ error: "attendence list not found" });
        } else {
          res.send(list);
        }
      })
  }

  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }

};

// exports.getStudentAttendence = async (req, res) => {
//   let studentId = req.params.studentId
//   if (!studentId) {
//     res.json({ status: false, error: "Student id  not found in params" });
//   }
//   let attendance = attendance.find({ studentId: studentId })
//   if (!attendance) {
//     res.json({ status: false, error: `Attendance data not found with this Student id  ${studentId}` });
//   }

//   res.json({ status: true, data: attendance })
// }
