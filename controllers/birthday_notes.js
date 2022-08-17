const birthdayNote = require("../models/birthday_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");

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
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let todays = new Date();
    let userId = req.params.userId;

    let birthdayData = await student
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
            leap: 1,
            todayDayOfYear: 1, primaryPhone:1,
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
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
        { $match: { daysTillBirthday: { $lt: 14 } } },
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
};

exports.fifteen_to_thirty = async (req, res) => {
  try {
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let todays = new Date();
    let userId = req.params.userId;

    let birthdayData = await student
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
        { $match: { daysTillBirthday: { $lt: 30, $gt: 14 } } },
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
};
exports.moreThirty = async (req, res) => {
  try {
    let todays = new Date();
    let userId = req.params.userId;
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let birthdayData = await student
      .aggregate([
        { $match: { userId: userId } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
            lastName: 1,
            status: 1,
            memberprofileImage: 1,
            notes: 1,
            birthday_notes: 1,
            program: 1,
            dob: 1,
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
        { $match: { daysTillBirthday: { $gt: 30 } } },
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
};

exports.thirtyToSixty = async (req, res) => {
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
};

exports.sixtyToNinety = async (req, res) => {
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
};

exports.tommarrow = async (req, res) => {
  let todays = new Date();
  try {
    await student
      .aggregate([
        { $match: { dob: { $exists: true } } },
        {
          $project: {
            firstName: 1,
            status: 1,
            lastName: 1,
            dob: 1,
            email: 1,
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    { $dayOfMonth: "$dob" },
                    { $subtract: [{ $dayOfMonth: "$$NOW" }, 1] },
                  ],
                },
                { $eq: [{ $month: "$dob" }, { $month: "$$NOW" }] },
              ],
            },
          },
        },
      ])
      .exec((err, memberdata) => {
        if (err) {
          console.log({
            error: err,
            success: false,
          });
        } else {
          console.log({
            memberdata,
          });
        }
      });
  } catch (er) {
    throw new Error(er);
  }
};

exports.birth_this_week = async (req, res) => {
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
};

exports.this_month = async (req, res) => {
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
};

exports.next_month = async (req, res) => {
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
};
