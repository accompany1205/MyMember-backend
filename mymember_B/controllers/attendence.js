const student = require("../models/addmember");
const schedule = require("../models/class_schedule");
const attendance = require("../models/attendence");

function TimeZone() {
  const str = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const date_time = str.split(",");
  console.log(date_time);
  const date = date_time[0];
  const time = date_time[1];
  return { Date: date, Time: time };
}

exports.search_std = (req, res) => {
  console.log(req.body.search);
  var regex = new RegExp("^" + req.body.search, "i");
  console.log(regex);
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
};

exports.create = async (req, res) => {
  var schdule_data = await schedule.findOne({ _id: req.params.scheduleId });
  if (schdule_data) {
    student.findOne({ _id: req.params.studentId }).exec((err, stdData) => {
      if (err) {
        res.send({ error: "student data not find" });
      } else {
        var stdDetails = {
          firstName: stdData.firstName,
          lastName: stdData.lastName,
          image: stdData.memberprofileImage,
          class: schdule_data.class_name,
          userId: req.params.userId,
          class_color: schdule_data.program_color,
          time: req.body.time,
        };
        var attendanceObj = new attendance(stdDetails);
        var DT = TimeZone();
        attendanceObj.date = DT.Date;
        attendanceObj.save((err, attendanceData) => {
          if (err) {
            res.send({ error: "addendance is not create" });
            console.log(err);
          } else {
            console.log(attendanceData);
            schedule.findByIdAndUpdate({ _id: req.params.scheduleId },{ $push: { class_attendance: attendanceData._id } }              )
              .exec((err, attendanceUpdte) => {
                if (err) {
                  res.send({error: "student addendance is not add in class",Error: err});
                } else {
                  console.log(attendanceUpdte);
                  student.updateOne({ _id: req.params.studentId },
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
                        console.log(err);
                      } else {
                        res.send({
                          msg: "student rating is update",
                          attendanceData: attendanceData,
                        });
                      }
                    });
                }
              });
          }
        });
        //     }
        // })
      }
    });
  } else {
    res.send({ msg: "schedule data not come" });
  }
};

exports.remove = (req, res) => {
  attendance.findByIdAndRemove(
    req.params.attendenceId,
    (err, removeAttendance) => {
      if (err) {
        res.send({ error: "attendance is not remove" });
      } else {
        schedule.updateOne(
          { class_attendance: removeAttendance._id },
          { $pull: { class_attendance: removeAttendance._id } },
          function (err, attendeRemove) {
            if (err) {
              res.send({ error: "student attendance is not remove in class" });
            } else {
              res.send({
                msg: "student attendance is remove successfully",
                result: removeAttendance,
              });
            }
          }
        );
      }
    }
  );
};

exports.list_attendence = (req, res) => {
  attendance.find({ userId: req.params.userId }).exec((err, list) => {
    if (err) {
      res.send({ error: "attendence list not found" });
    } else {
      res.send(list);
    }
  });
};
