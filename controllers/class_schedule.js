const class_schedule = require("../models/class_schedule");
const Prog = require("../models/program");
const dateRange = require("../Services/dateRange");
var moment = require("moment");
const { errorHandler } = require("../helpers/dbErrorHandler");
var mongo = require("mongoose");
const { v4: uuidv4 } = require("uuid");

exports.Create = async (req, res) => {
  let reqBody = req.body;
  let startDate = moment(reqBody.start_date, "MM/DD/YYYY").format("MM/DD/YYYY");
  let endDate = moment(reqBody.end_date, "MM/DD/YYYY").format("MM/DD/YYYY");
  let repeat_weekly_on = reqBody.repeat_weekly_on;

  try {
    const dates = dateRange(startDate, endDate);
    let allAttendance = [];
    series_id = mongo.Types.ObjectId();
    if (dates.length > 1) {
      for (let index in dates) {
        let date = moment(dates[index], "MM/DD/YYYY").format("MM/DD/YYYY");
        let dayName = moment(new Date(date)).format("dddd").toLowerCase();
        console.log(dayName, "dayName");
        console.log(repeat_weekly_on, "repeat_weekly_on");
        if (repeat_weekly_on.includes(dayName)) {
          let NewEvent = {
            ...reqBody,
            series_id,
            start_date: date,
            end_date: date,
            wholeSeriesEndDate: endDate,
            wholeSeriesStartDate: startDate,
          };
          allAttendance.push(NewEvent);
        }
      }
    } else if (dates.length === 1) {
      let date = moment(dates[0], "MM/DD/YYYY").format("MM/DD/YYYY");
      let NewEvent = {
        ...reqBody,
        start_date: date,
        end_date: date,
        series_id,
        wholeSeriesEndDate: endDate,
        wholeSeriesStartDate: startDate,
      };
      allAttendance.push(NewEvent);
    }
    await class_schedule
      .insertMany(allAttendance)
      .then((result) => {
        res.send({ msg: "Class schedule succefully!", success: true });
      })
      .catch((error) => {
        res.send({ error: error.message.replace(/\"/g, ""), success: false });
      });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

//checking

exports.read = async (req, res) => {
  try {
    let result = await class_schedule.find({
      userId: req.params.userId,
      isActive: true,
    });
    res.send({ data: result, success: true });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false });
  }
};

exports.readSchedule = async (req, res) => {
  let startDate = req.params.dates;
  let monthStartDate = moment(startDate).startOf("month").format("MM/DD/YYYY");
  let monthEndDate = moment(startDate).endOf("month").format("MM/DD/YYYY");

  try {
    class_schedule
      .find({
        isActive: true,
        $and: [
          { userId: req.params.userId },
          { start_date: { $gte: monthStartDate, $lt: monthEndDate } },
        ],
      })
      .then((result) => {
        return res.send({ success: true, data: result });
      })
      .catch((err) => {
        console.log(err, "err");
        return res.send({ msg: "No data!", success: false });
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.class_schedule_Info = (req, res) => {
  try {
    const id = req.params.scheduleId;
    const userId = req.params.userId;
    var objId = mongo.Types.ObjectId(id);
    class_schedule
      .aggregate([
        { $match: { _id: objId } },
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            end_date: 1,
            start_time: 1,
            end_time: 1,
            program_color: 1,
            class_attendanceArray: 1,
          },
        },
        {
          $lookup: {
            from: "members",
            localField: "class_attendanceArray.studentInfo",
            foreignField: "_id",
            as: "data",
          },
        },
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            end_date: 1,
            start_time: 1,
            end_time: 1,
            program_color: 1,
            class_attendanceArray: 1,
            "data.firstName": 1,
            "data.lastName": 1,
            "data.memberprofileImage": 1,
            "data._id": 1,
          },
        },
        {
          $addFields: {
            attendence: {
              $map: {
                input: "$class_attendanceArray",
                in: {
                  $mergeObjects: [
                    "$$this",
                    {
                      $arrayElemAt: [
                        "$data",
                        { $indexOfArray: ["$data._id", "$$this.studentInfo"] },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: { data: 0, class_attendanceArray: 0 },
        },
      ])
      .exec((err, list) => {
        if (err) {
          res.send({ error: "attendence list not found" });
        } else {
          res.send({ data: list, success: true });
        }
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.update = (req, res) => {
  const id = req.params.scheduleId;
  class_schedule
    .findByIdAndUpdate(id, { $set: req.body })
    .then((update_resp) => {
      res.status(200).send("class schedule has been updated successfully");
    })
    .catch((error) => {
      res.send({ error: error.message.replace(/\"/g, ""), success: false });
    });
};

// let startTimeH = null
//         let startTimeM = null

//         let endTimeH = null
//         let endTimeM = null
//         if (moment(event?.start_time)?._isValid) {
//           startTimeH = moment(event?.start_time)?.format('HH')
//           startTimeM = moment(event?.start_time)?.format('MM')

//           endTimeH = moment(event?.end_time)?.format('HH')
//           endTimeM = moment(event?.end_time)?.format('MM')
//         } else {
//           startTimeH = event?.start_time.split(':')[0]
//           startTimeM = event?.start_time.split(':')[1]

//           endTimeH = event?.end_time.split(':')[0]
//           endTimeM = event?.end_time.split(':')[1]
//         }
//         // console.log(moment(event.start_date).set({ hour: Number(startTimeH), minute: Number(startTimeM) }))
//         event.start = new Date(moment(event.start_date).set({ hour: Number(startTimeH), minute: Number(startTimeM) })?._d)//new Date(event.start_time);
//         event.end = new Date(moment(event.end_date).set({ hour: Number(endTimeH), minute: Number(endTimeM) })?._d)// new Date(event.end_time);
//         event.title = event.class_name;
//         return event;

exports.updateAll = async (req, res) => {
  try {
    let reqBody = req.body;
    if (reqBody.isResetTimeline) {
      let start_time = moment(reqBody.start_time).format("MM/DD/YYYY");
      let end_time = moment(reqBody.end_time).format("MM/DD/YYYY");
      let repeat_weekly_on = reqBody.repeat_weekly_on;
      let startTimeH = moment(reqBody.start_time).format("hh");
      let startTimeM = moment(reqBody.start_time).format("mm");
      let startTimeA = moment(reqBody.start_time).format("A");
      let endTimeH = moment(reqBody.end_time).format("hh");
      let endTimeM = moment(reqBody.end_time).format("mm");
      let endTimeP = moment(reqBody.end_time).format("A");
      const dates = dateRange(start_time, end_time);
      console.log(startTimeA);
      console.log(endTimeP);

      let allAttendance = [];
      for (let index in dates) {
        let d = moment(dates[index], "MM/DD/YYYY").format();
        let start_date = moment(dates[index], "MM/DD/YYYY").format(
          "MM/DD/YYYY"
        );
        let date = new Date(
          moment(d).set({
            hour: Number(startTimeH),
            minute: Number(startTimeM),
            meridiem: startTimeA,
          })
        );
        console.log(date);
        let dateE = new Date(
          moment(d).set({
            hour: Number(endTimeH),
            minute: Number(endTimeM),
            meridiem: endTimeP,
          })
        );
        console.log(dateE);
        let dayName = moment(new Date(date)).format("dddd").toLowerCase();
        if (repeat_weekly_on.includes(dayName)) {
          let NewEvent = {
            ...reqBody,
            start_time: date,
            end_time: dateE,
            start_date: start_date,
            end_date: start_date,
            wholeSeriesEndDate: end_time,
            wholeSeriesStartDate: start_time,
          };
          allAttendance.push(NewEvent);
        }
      }

      class_schedule
        .updateMany(
          {
            series_id: reqBody.series_id,
          },
          { isActive: false }
        )
        .then(async (update_resp) => {
          if (update_resp.deletedCount < 1) {
            return res.status(403).json({
              message: "class_name not found",
              success: false,
            });
          } else {
            const res1 = await class_schedule.insertMany(allAttendance);
            res.status(200).json({
              message: "All class schedule has been updated Successfully",
              success: true,
            });
          }
        })
        .catch((err) => {
          res.send({ err: err.message.replace(/\"/g, ""), success: false });
        });
    } else {
      await class_schedule
        .updateMany(
          { series_id: reqBody.series_id },
          {
            program_name: req.body.program_name,
            class_name: req.body.class_name,
          }
        )
        .exec((err, updateFolder) => {
          if (err) {
            res.send({ msg: "Classes not updated!", success: false });
          } else {
            res.send({
              msg: "All class schedule has been updated Successfully",
              success: true,
            });
          }
        });
    }
  } catch (err) {
    res.send({ err: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.remove = (req, res) => {
  const id = req.params.scheduleId;
  class_schedule
    .deleteOne({ _id: id })
    .then((resp) => {
      res.json({
        msg: "class schedule has been deleted successfully",
        success: true,
      });
    })
    .catch((error) => {
      res.send({ error: error.message.replace(/\"/g, ""), success: false });
    });
};

exports.removeAll = (req, res) => {
  // const id = req.params.scheduleId
  class_schedule
    .deleteMany({
      $and: [
        { userId: req.params.userId },
        { program_name: req.body.program_name },
        { class_name: req.body.class_name },
      ],
    })
    .then((resp) => {
      if (resp.deletedCount < 1) {
        res.status(403).json({
          message: "class_name/program_name not found",
          success: false,
        });
      } else {
        res.status(200).json({
          message: "All class schedule has been deleted Successfully",
          success: true,
        });
      }
    })
    .catch((error) => {
      res.send({ error: error.message.replace(/\"/g, ""), success: false });
    });
};

exports.searchClasses = async (req, res) => {
  try {
    const search = req.query.search;
    const data = await class_schedule.find({
      $or: [
        { class_name: { $regex: search, $options: "i" } },
        { program_name: { $regex: search, $options: "i" } },
        { start_date: { $regex: search, $options: "i" } },
      ],
    });
    res.send({ data, success: false });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
