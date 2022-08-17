const misucallNote = require("../models/misucall_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const classes = require("../models/class_schedule");
const memberShip = require("../models/membership");
const missYouCallNotes = require("../models/misucall_notes");
const _ = require("lodash");
const daysRemaining = require("../Services/daysremaining");
var mongo = require("mongoose");
const misucall_notes = require("../models/misucall_notes");




exports.all_data=async (req,res)=>{
  if(req.params.multiple_data==="This week"){
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let todays = new Date();
  
    let userId = req.params.userId;
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    try {
      await student
        .aggregate([
          { $match: filter },
  
          {
            $project: {
              firstName: 1,
              dob: {
                $dateFromParts: {
                  year: { $year: "$dob" },
                  month: { $month: "$dob" },
                  day: { $dayOfMonth: "$dob" },
                },
              },
              birthDate: {
                $dateFromParts: {
                  year: { $year: todays },
                  month: { $month: "$dob" },
                  day: { $dayOfMonth: "$dob" },
                },
              },
              status: 1,
              studentType: 1,
              lastName: 1,
              primaryPhone: 1,
              current_rank_img: 1,
              program: 1,
              followup_notes: 1,
              daysTillBirthday: {
                $subtract: [
                  {
                    $subtract: [{ $dayOfMonth: "$dob" }, { $dayOfMonth: todays }],
                  },
                  1,
                ],
              },
            },
          },
          {
            $match: {
              $expr: { $eq: [{ $week: "$birthDate" }, { $week: todays }] },
              daysTillBirthday: { $gte: -1 },
            },
          },
          {
            $lookup: {
              from: "followupnotes",
              localField: "followup_notes",
              foreignField: "_id",
              as: "followup_notes",
              pipeline: [
                {
                  $project: {
                    note: 1,
                    time: 1,
                    date: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              firstName: 1,
              status: 1,
              lastName: 1,
              dob: 1,
              primaryPhone: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              daysTillBirthday: 1,
              notes: { $arrayElemAt: ["$followup_notes", -1] },
            },
          },
          { $sort: { daysTillBirthday: 1 } },
          {
            $facet: {
              paginatedResults: [
                { $skip: pagination.skip },
                { $limit: pagination.limit },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
              success: false,
            });
          } else {
            let data = memberdata[0].paginatedResults;
            if (data.length > 0) {
              res.send({
                data: data,
                totalCount: memberdata[0].totalCount[0].count,
                success: true,
              });
            } else {
              res.send({ msg: "data not found", success: false });
            }
          }
        });
    } catch (er) {
      throw new Error(er);
    }
  }else if(req.params.multiple_data==="This month"){
    var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };

  let todays = new Date();
  let userId = req.params.userId;
  const studentType = req.query.studentType;
  const filter =
    userId && studentType
      ? {
          userId,
          studentType,
        }
      : {
          userId,
        };

  try {
    await student
      .aggregate([
        { $match: filter },

        {
          $project: {
            firstName: 1,
            dob: 1,
            studentType: 1,
            status: 1,
            lastName: 1,
            primaryPhone: 1,
            current_rank_img: 1,
            program: 1,
            followup_notes: 1,
             primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1,
            daysTillBirthday: {
              $subtract: [
                {
                  $subtract: [{ $dayOfMonth: "$dob" }, { $dayOfMonth: todays }],
                },
                1,
              ],
            },
          },
        },
        {
          $match: {
            $expr: { $eq: [{ $month: "$dob" }, { $month: todays }] },
            daysTillBirthday: { $gte: -1 },
          },
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  time: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            dob: 1,
            primaryPhone: 1,
            studentType: 1,
            program: 1,
            current_rank_img: 1,
            status: 1,
            daysTillBirthday: 1,
            primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1,
            notes: { $arrayElemAt: ["$followup_notes", -1] },
          },
        },
        { $sort: { daysTillBirthday: 1 } },
        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
            success: false,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (er) {
    throw new Error(er);
  }
  }else if (req.params.multiple_data==="next month"){
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let todays = new Date();
    let nextMonth = new Date(todays.setMonth(todays.getMonth() + 1));
    let userId = req.params.userId;
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    try {
      const nextMonthBirthday = await student
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              status: 1,
              lastName: 1,
              program: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
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
              lastName: 1,
              program: 1,
              current_rank_img: 1,
              status: 1,
              dob: 1,
              followup_notes: 1,
              leap: 1,
              todayDayOfYear: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              dayOfYear: {
                $subtract: [
                  "$dayOfYear",
                  {
                    $cond: [
                      { $and: ["$leap", { $gt: ["$dayOfYear", 59] }] },
                      1,
                      0,
                    ],
                  },
                ],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              status: 1,
              lastName: 1,
              program: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              daysTillBirthday: {
                $subtract: [
                  {
                    $subtract: [
                      {
                        $add: [
                          "$dayOfYear",
                          {
                            $cond: [
                              { $lt: ["$dayOfYear", "$todayDayOfYear"] },
                              365,
                              0,
                            ],
                          },
                        ],
                      },
                      "$todayDayOfYear",
                    ],
                  },
                  1,
                ],
              },
            },
          },
          {
            $match: {
              $expr: {
                $eq: [{ $month: "$dob" }, { $month: nextMonth }],
              },
              //         // daysTillBirthday: { $lt: 11 },
              //     //   },
            },
          },
          {
            $lookup: {
              from: "followupnotes",
              localField: "followup_notes",
              foreignField: "_id",
              as: "followup_notes",
              pipeline: [
                {
                  $project: {
                    note: 1,
                    time: 1,
                    date: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              dob: 1,
              primaryPhone: 1,
              studentType: 1,
              status: 1,
              program: 1,
              current_rank_img: 1,
              daysTillBirthday: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              notes: { $arrayElemAt: ["$followup_notes", -1] },
            },
          },
          { $sort: { daysTillBirthday: 1 } },
          {
            $facet: {
              paginatedResults: [
                { $skip: pagination.skip },
                { $limit: pagination.limit },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
  
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
              success: false,
            });
          } else {
            let data = memberdata[0].paginatedResults;
            if (data.length > 0) {
              res.send({
                data: data,
                totalCount: memberdata[0].totalCount[0].count,
                success: true,
              });
            } else {
              res.send({ msg: "data not found", success: false });
            }
          }
        });
    } catch (er) {
      throw new Error(er);
    }
  }else if (req.params.multiple_data==="60"){
    try {
      let todays = new Date();
      let userId = req.params.userId;
      var per_page = parseInt(req.params.per_page) || 5;
      var page_no = parseInt(req.params.page_no) || 0;
      var pagination = {
        limit: per_page,
        skip: per_page * page_no,
      };
      const studentType = req.query.studentType;
      const filter =
        userId && studentType
          ? {
              userId,
              studentType,
            }
          : {
              userId,
            };
      student
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              primaryPhone: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
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
              lastName: 1,
              status: 1,
              primaryPhone: 1,
              program: 1,
              studentType: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              todayDayOfYear: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              dayOfYear: {
                $subtract: [
                  "$dayOfYear",
                  {
                    $cond: [
                      { $and: ["$leap", { $gt: ["$dayOfYear", 59] }] },
                      1,
                      0,
                    ],
                  },
                ],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              primaryPhone: 1,
              program: 1,
              status: 1,
              studentType: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              daysTillBirthday: {
                $subtract: [
                  {
                    $add: [
                      "$dayOfYear",
                      {
                        $cond: [
                          { $lt: ["$dayOfYear", "$todayDayOfYear"] },
                          365,
                          0,
                        ],
                      },
                    ],
                  },
                  "$todayDayOfYear",
                ],
              },
            },
          },
          { $match: { daysTillBirthday: { $lt: 60, $gte: 30 } } },
          {
            $lookup: {
              from: "followupnotes",
              localField: "followup_notes",
              foreignField: "_id",
              as: "followup_notes",
              pipeline: [
                {
                  $project: {
                    note: 1,
                    time: 1,
                    date: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              dob: 1,
              primaryPhone: 1,
              status: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              daysTillBirthday: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              notes: { $arrayElemAt: ["$followup_notes", -1] },
            },
          },
          { $sort: { daysTillBirthday: 1 } },
          {
            $facet: {
              paginatedResults: [
                { $skip: pagination.skip },
                { $limit: pagination.limit },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
              success: false,
            });
          } else {
            let data = memberdata[0].paginatedResults;
            if (data.length > 0) {
              res.send({
                data: data,
                totalCount: memberdata[0].totalCount[0].count,
                success: true,
              });
            } else {
              res.send({ msg: "data not found", success: false });
            }
          }
        });
    } catch (err) {
      throw new Error(err);
    }
  }else if (req.params.multiple_data==="90"){
    try {
      let todays = new Date();
      let userId = req.params.userId;
      var per_page = parseInt(req.params.per_page) || 5;
      var page_no = parseInt(req.params.page_no) || 0;
      var pagination = {
        limit: per_page,
        skip: per_page * page_no,
      };
      const studentType = req.query.studentType;
      const filter =
        userId && studentType
          ? {
              userId,
              studentType,
            }
          : {
              userId,
            };
      student
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              primaryPhone: 1,
              program: 1,
              current_rank_img: 1,
              studentType: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
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
              lastName: 1,
              status: 1,
              primaryPhone: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              todayDayOfYear: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              dayOfYear: {
                $subtract: [
                  "$dayOfYear",
                  {
                    $cond: [
                      { $and: ["$leap", { $gt: ["$dayOfYear", 59] }] },
                      1,
                      0,
                    ],
                  },
                ],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              primaryPhone: 1,
              status: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              dob: 1,
              followup_notes: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              daysTillBirthday: {
                $subtract: [
                  {
                    $add: [
                      "$dayOfYear",
                      {
                        $cond: [
                          { $lt: ["$dayOfYear", "$todayDayOfYear"] },
                          365,
                          0,
                        ],
                      },
                    ],
                  },
                  "$todayDayOfYear",
                ],
              },
            },
          },
          { $match: { daysTillBirthday: { $gte: 60 } } },
          {
            $lookup: {
              from: "followupnotes",
              localField: "followup_notes",
              foreignField: "_id",
              as: "followup_notes",
              pipeline: [
                {
                  $project: {
                    note: 1,
                    time: 1,
                    date: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              dob: 1,
              status: 1,
              studentType: 1,
              primaryPhone: 1,
              studentType: 1,
              program: 1,
              current_rank_img: 1,
              daysTillBirthday: 1,
              primaryPhone:1,
              street:1,
              town:1,
              state:1,
              zipPostalCode:1,
              email:1,
              notes: { $arrayElemAt: ["$followup_notes", -1] },
            },
          },
          { $sort: { daysTillBirthday: 1 } },
          {
            $facet: {
              paginatedResults: [
                { $skip: pagination.skip },
                { $limit: pagination.limit },
              ],
              totalCount: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
              success: false,
            });
          } else {
            let data = memberdata[0].paginatedResults;
            if (data.length > 0) {
              res.send({
                data: data,
                totalCount: memberdata[0].totalCount[0].count,
                success: true,
              });
            } else {
              res.send({ msg: "data not found", success: false });
            }
          }
        });
    } catch (err) {
      throw new Error(err);
    }
  }
}





exports.seven_to_forteen = async (req, res) => {
  try {
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    await student
      .aggregate([
        {
          $match: filter,
        },
        {
          $project: {
            primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1,
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            followup_notes: 1,
            studentType: 1,
          },
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  time: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            last_attended_date: {
              $ne: null,
            },
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            studentType: 1,
            primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $addFields: {
            dayssince: {
              $floor: {
                $divide: [
                  {
                    $subtract: ["$$NOW", "$last_attended_date"],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $match: {
            dayssince: {
              $gte: 7,
              $lte: 14,
            },
          },
        },
        { $sort: { dayssince: 1 } },
        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (err) {
    throw new Error(err);
  }
};

exports.fifteen_to_thirty = async (req, res) => {
  try {
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    await student
      .aggregate([
        {
          $match: filter,
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            followup_notes: 1,
            studentType: 1, primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  time: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            last_attended_date: {
              $ne: null,
            },
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            studentType: 1, primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $addFields: {
            dayssince: {
              $floor: {
                $divide: [
                  {
                    $subtract: ["$$NOW", "$last_attended_date"],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $match: {
            dayssince: {
              $gte: 15,
              $lte: 30,
            },
          },
        },
        { $sort: { dayssince: 1 } },
        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (err) {
    throw new Error(err);
  }
};

exports.Thirty_to_sixty = async (req, res) => {
  try {
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    await student
      .aggregate([
        {
          $match: filter,
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            followup_notes: 1,
            studentType: 1, primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  time: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            last_attended_date: {
              $ne: null,
            },
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            studentType: 1,
            primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1,
          },
        },
        {
          $addFields: {
            dayssince: {
              $floor: {
                $divide: [
                  {
                    $subtract: ["$$NOW", "$last_attended_date"],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $match: {
            dayssince: {
              $gte: 31,
              $lte: 60,
            },
          },
        },
        { $sort: { dayssince: 1 } },
        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (err) {
    throw new Error(err);
  }
};

exports.more_than_sixty = async (req, res) => {
  try {
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    const studentType = req.query.studentType;
    const filter =
      userId && studentType
        ? {
            userId,
            studentType,
          }
        : {
            userId,
          };
    await student
      .aggregate([
        {
          $match: filter,
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            followup_notes: 1,
            studentType: 1, primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  time: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            last_attended_date: {
              $ne: null,
            },
          },
        },
        {
          $addFields: {
            last_attended_date: {
              $toDate: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: {
                    $toDate: "$last_attended_date",
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            last_attended_date: 1,
            attendedclass_count: 1,
            studentType: 1,
            primaryPhone:1,
            street:1,
            town:1,
            state:1,
            zipPostalCode:1,
            email:1
          },
        },
        {
          $addFields: {
            dayssince: {
              $floor: {
                $divide: [
                  {
                    $subtract: ["$$NOW", "$last_attended_date"],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $match: {
            dayssince: {
              $gte: 61,
            },
          },
        },
        { $sort: { dayssince: 1 } },
        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (err) {
    throw new Error(err);
  }
};

exports.listApp_and_callHistory = (req, res) => {
  user
    .find({ _id: req.params.userId }, { upsert: true })
    .populate("missYouCall_note_history")
    .populate("missYouCall_appoinment_history")
    .exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    });
};

exports.create = (req, res) => {
  student.findById(req.params.studentId).exec((err, studetData) => {
    if (err) {
      res.send({ error: "student data not found" });
    } else {
      var obj = {
        firstName: studetData.firstName,
        lastName: studetData.lastName,
        userId: req.params.userId,
      };
      var misucall = new misucallNote(req.body);
      misucallObj = _.extend(misucall, obj);

      misucallObj.save((err, note) => {
        if (err) {
          res.send({ error: "miss u call notes is not create" });
        } else {
          (update = {
            $push: { missYouCall_notes: note._id },
            $set: { last_contact_missCall: new Date() },
          }),
            student
              .findByIdAndUpdate(req.params.studentId, update)
              .exec((err, missuCallStd) => {
                if (err) {
                  res.send({
                    error: "miss u call notes is not add in student",
                  });
                } else {
                  // res.send(note)
                  user
                    .findByIdAndUpdate(req.params.userId, {
                      $push: { missYouCall_note_history: note._id },
                    })
                    .exec((err, missuCallUser) => {
                      if (err) {
                        res.send({
                          error: "miss u call notes is not add in school",
                        });
                      } else {
                        res.send({
                          msg: "miss u call note create successfuly",
                          note: note,
                        });
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
  misucallNote.findByIdAndRemove({ _id: notesId }, (err, removeNote) => {
    if (err) {
      res.send({ error: "notes is not delete" });
    } else {
      student
        .update(
          { missYouCall_notes: removeNote._id },
          { $pull: { missYouCall_notes: removeNote._id } }
        )
        .exec((err, noteUpdateStd) => {
          if (err) {
            res.send({ error: "notes is not remove in student" });
          } else {
            user
              .update(
                { missYouCall_note_history: removeNote._id },
                { $pull: { missYouCall_note_history: removeNote._id } }
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
  misucallNote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
    if (err) {
      res.send({ error: "miss you call notes is not update" });
    } else {
      res.send({ msg: "miss you call notes update successfully" });
    }
  });
};

exports.more_than_forteen = async (req, res) => {
  try {
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    await classes
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            program_name: 1,
            class_name: 1,
            start_date: 1,
            end_date: 1,
            program_color: 1,
            class_attendanceArray: 1,
            repeat_weekly_on: 1,
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
            program_color: 1,
            class_attendanceArray: 1,
            repeat_weekly_on: 1,
            "data.firstName": 1,
            "data.lastName": 1,
            "data.studentType": 1,
            "data.primaryPhone": 1,
            "data.memberprofileImage": 1,
            "data.missYouCall_notes": 1,
            "data.last_attended_date": 1,
            "data.attendedclass_count": 1,
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
          $project: {
            data: 0,
            class_attendanceArray: 0,
          },
        },
        {
          $addFields: {
            "attendence._id": "$_id",
            "attendence.class_name": "$class_name",
            "attendence.program_name": "$program_name",
            "attendence.program_color": "$program_color",
            "attendence.repeat_weekly_on": "$repeat_weekly_on",
          },
        },
        /** Unwind items array, will exclude docs where items is not an array/doesn't exists */
        {
          $unwind: "$attendence",
        },
        /** Replace 'response.items' object as new root(document) */
        {
          $replaceRoot: {
            newRoot: "$attendence",
          },
        },
        {
          $group: {
            _id: "$studentInfo",
            latestDate: {
              $max: {
                $mergeObjects: [
                  {
                    epochTime: "$epochTime",
                  },
                  "$$ROOT",
                ],
              },
            },
          },
        },
        {
          $addFields: {
            name: "$_id",
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $unwind: {
            path: "$latestDate",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$latestDate",
          },
        },
        {
          $project: {
            epochTime: 1,
            studentInfo: 1,
            time: 1,
            date: 1,
            _id: 1,
            firstName: 1,
            lastName: 1,
            studentType: 1,
            primaryPhone: 1,
            class_name: 1,
            program_color: 1,
            repeat_weekly_on: 1,
            last_attended_date: 1,
            dayssince: {
              $floor: {
                $divide: [
                  {
                    $subtract: [
                      new Date(),
                      {
                        $dateFromString: {
                          dateString: "$epochTime",
                        },
                      },
                    ],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $match: {
            dayssince: {
              $gte: 14,
            },
          },
        },
        { $sort: { dayssince: 1 } },

        {
          $facet: {
            paginatedResults: [
              { $skip: pagination.skip },
              { $limit: pagination.limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            error: err,
          });
        } else {
          let data = memberdata[0].paginatedResults;
          if (data.length > 0) {
            res.send({
              data: data,
              totalCount: memberdata[0].totalCount[0].count,
              success: true,
            });
          } else {
            res.send({ msg: "data not found", success: false });
          }
        }
      });
  } catch (err) {
    throw new Error(err);
  }
};

exports.missclasses = async (req, res) => {
  try {
    let [id] = await student.aggregate([
      {
        $group: {
          _id: " ",
          id: { $push: "$_id" },
        },
      },
      {
        $project: {
          id: 1,
          _id: 0,
        },
      },
    ]);

    id = id.id;
    for await (const i of id) {
      let data = await classes.aggregate([
        {
          $project: {
            class_name: 1,
            class_attendanceArray: "$class_attendanceArray.studentInfo",
          },
        },
        { $match: { class_attendanceArray: { $nin: [i] } } },
        {
          $group: {
            _id: "_id",
            missclass_count: {
              $sum: 1,
            },
          },
        },
        { $project: { _id: 0 } },
      ]);

      let { missclass_count } = data[0];
      await updateStudentsById(i, missclass_count);
    }
    // console.log("miss_Classes updated!");
  } catch (err) {
    throw new Error(err);
  }
};
const updateStudentsById = async (studentId, missclass_count) => {
  return student.findByIdAndUpdate(
    { _id: studentId },
    { missclass_count: missclass_count }
  );
};
