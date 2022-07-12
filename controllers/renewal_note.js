const renewalnote = require("../models/renewal_note");
const student = require("../models/addmember");
const user = require("../models/user");
const buymembership = require("../models/buy_membership");
const _ = require("lodash");
const moment = require("moment");
const dayRemaining = require("../Services/daysremaining");
// const { forEach } = require("lodash");

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

      var renewal = new renewalnote(req.body);
      renewObj = _.extend(renewal, obj);

      renewObj.save((err, note) => {
        if (err) {
          res.send({ error: "renewal notes is not create" });
        } else {
          student
            .findByIdAndUpdate(req.params.studentId, {
              $push: { renewals_notes: note._id },
            })
            .exec((err, renewalStd) => {
              if (err) {
                res.send({ error: "renewal notes is not add in student" });
              } else {
                // res.send(note)2021
                user
                  .findByIdAndUpdate(req.params.userId, {
                    $push: { renewal_history: note._id },
                  })
                  .exec((err, renewalUser) => {
                    if (err) {
                      res.send({ error: "renewal notes is not add in school" });
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
  renewalnote.findByIdAndRemove({ _id: notesId }, (err, removeNote) => {
    if (err) {
      res.send({ error: "notes is not delete" });
    } else {
      student
        .update(
          { renewals_notes: removeNote._id },
          { $pull: { renewals_notes: removeNote._id } }
        )
        .exec((err, noteUpdateStd) => {
          if (err) {
            res.send({ error: "notes is not remove in student" });
          } else {
            user
              .update(
                { renewal_history: removeNote._id },
                { $pull: { renewal_history: removeNote._id } }
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
  renewalnote.findByIdAndUpdate(notesid, req.body).exec((err, updateNote) => {
    if (err) {
      res.send({ error: "miss you call notes is not update" });
    } else {
      res.send({ msg: "miss you call notes update successfully" });
    }
  });
};

exports.expire_thirty_std = async (req, res) => {
  try {
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

    buymembership
      .aggregate([
        { $match: { userId: userId } },

        {
          $project: {
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            studentInfo: 1,
            expiry_date: {
              $toDate: "$expiry_date",
            },
          },
        },
        {
          $addFields: {
            days_till_Expire: {
              $multiply: [
                {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [new Date(), "$expiry_date"],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
                -1,
              ],
            },
          },
        },
        {
          $match: {
            days_till_Expire: {
              $lte: 30,
              $gt: 0,
            },
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $lookup: {
            from: "members",
            localField: "studentInfo",
            foreignField: "_id",
            as: "members",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  program: 1,
                  notes: 1,
                  primaryPhone: 1,
                  studentType: 1,
                  last_attended_date: 1,
                  memberprofileImage: 1,
                  status: 1,
                  followup_notes: 1,
                  userId: 1,
                },
              },
              {
                $match: filter,
              },
            ],
          },
        },
        {
          $match: {
            members: {
              $ne: [],
            },
          },
        },
        {
          $unwind: "$members",
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "members.followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            studentInfo: 1,
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            expiry_date: 1,
            days_till_Expire: 1,
            members: 1,
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
          },
        },
        {
          $group: {
            _id: "$studentInfo",
            no_of_Memberships: {
              $sum: 1,
            },
            firstName: {
              $first: "$members.firstName",
            },
            lastName: {
              $first: "$members.lastName",
            },
            notes: {
              $first: "$notes",
            },
            program: {
              $first: "$members.program",
            },
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            studentType: {
              $first: "$members.studentType",
            },
            last_attended_date: {
              $first: "$members.last_attended_date",
            },
            memberprofileImage: {
              $first: "$members.memberprofileImage",
            },
            status: {
              $first: "$members.status",
            },
            memberships: {
              $push: {
                membership_name: "$membership_name",
                membership_type: "$membership_type",
                membership_status: "$membership_status",
                expiry_date: "$expiry_date",
                days_till_Expire: "$days_till_Expire",
                whenFreeze: "$whenFreeze",
              },
            },
          },
        },
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
  } catch (e) {
    res.send({ error: "expire student data not fount", a: e });
  }
};

exports.expire_sixty_std = async (req, res) => {
  try {
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
    buymembership
      .aggregate([
        { $match: { userId: userId } },

        {
          $project: {
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            studentInfo: 1,
            expiry_date: {
              $toDate: "$expiry_date",
            },
          },
        },
        {
          $addFields: {
            days_till_Expire: {
              $multiply: [
                {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [new Date(), "$expiry_date"],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
                -1,
              ],
            },
          },
        },
        {
          $match: {
            days_till_Expire: {
              $lte: 60,
              $gt: 29,
            },
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $lookup: {
            from: "members",
            localField: "studentInfo",
            foreignField: "_id",
            as: "members",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  program: 1,
                  notes: 1,
                  primaryPhone: 1,
                  studentType: 1,
                  last_attended_date: 1,
                  memberprofileImage: 1,
                  status: 1,
                  followup_notes: 1,
                  userId: 1,
                },
              },
              { $match: filter },
            ],
          },
        },
        {
          $match: {
            members: {
              $ne: [],
            },
          },
        },
        {
          $unwind: "$members",
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "members.followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            studentInfo: 1,
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            expiry_date: 1,
            days_till_Expire: 1,
            members: 1,
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
          },
        },
        {
          $group: {
            _id: "$studentInfo",
            no_of_Memberships: {
              $sum: 1,
            },
            firstName: {
              $first: "$members.firstName",
            },
            lastName: {
              $first: "$members.lastName",
            },
            notes: {
              $first: "$notes",
            },
            program: {
              $first: "$members.program",
            },
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            studentType: {
              $first: "$members.studentType",
            },
            last_attended_date: {
              $first: "$members.last_attended_date",
            },
            memberprofileImage: {
              $first: "$members.memberprofileImage",
            },
            status: {
              $first: "$members.status",
            },
            memberships: {
              $push: {
                membership_name: "$membership_name",
                membership_type: "$membership_type",
                membership_status: "$membership_status",
                expiry_date: "$expiry_date",
                days_till_Expire: "$days_till_Expire",
                whenFreeze: "$whenFreeze",
              },
            },
          },
        },
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
  } catch (e) {
    res.send({ error: "expire student data not fount" });
  }
};

exports.expire_ninty_std = async (req, res) => {
  try {
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
    buymembership
      .aggregate([
        { $match: { userId: userId } },

        {
          $project: {
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            studentInfo: 1,
            expiry_date: {
              $toDate: "$expiry_date",
            },
          },
        },
        {
          $addFields: {
            days_till_Expire: {
              $multiply: [
                {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [new Date(), "$expiry_date"],
                      },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
                -1,
              ],
            },
          },
        },
        {
          $match: {
            days_till_Expire: {
              $lte: 90,
              $gt: 59,
            },
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $lookup: {
            from: "members",
            localField: "studentInfo",
            foreignField: "_id",
            as: "members",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  program: 1,
                  notes: 1,
                  primaryPhone: 1,
                  studentType: 1,
                  last_attended_date: 1,
                  memberprofileImage: 1,
                  status: 1,
                  followup_notes: 1,
                  userId: 1,
                },
              },
              { $match: filter },
            ],
          },
        },
        {
          $match: {
            members: {
              $ne: [],
            },
          },
        },
        {
          $unwind: "$members",
        },
        {
          $lookup: {
            from: "followupnotes",
            localField: "members.followup_notes",
            foreignField: "_id",
            as: "followup_notes",
            pipeline: [
              {
                $project: {
                  note: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            studentInfo: 1,
            membership_name: 1,
            membership_type: 1,
            membership_status: 1,
            expiry_date: 1,
            days_till_Expire: 1,
            members: 1,
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
          },
        },
        {
          $group: {
            _id: "$studentInfo",
            no_of_Memberships: {
              $sum: 1,
            },
            firstName: {
              $first: "$members.firstName",
            },
            lastName: {
              $first: "$members.lastName",
            },
            notes: {
              $first: "$notes",
            },
            program: {
              $first: "$members.program",
            },
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            studentType: {
              $first: "$members.studentType",
            },
            last_attended_date: {
              $first: "$members.last_attended_date",
            },
            memberprofileImage: {
              $first: "$members.memberprofileImage",
            },
            status: {
              $first: "$members.status",
            },
            memberships: {
              $push: {
                membership_name: "$membership_name",
                membership_type: "$membership_type",
                membership_status: "$membership_status",
                expiry_date: "$expiry_date",
                days_till_Expire: "$days_till_Expire",
                whenFreeze: "$whenFreeze",
              },
            },
          },
        },
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
  } catch (e) {
    res.send({ error: "expire student data not fount" });
  }
};

exports.frozenmembership = async (req, res) => {
  try {
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
        { $match: { userId: userId } },

        {
          $project: {
            firstName: 1,
            lastName: 1,
            program: 1,
            primaryPhone: 1,
            studentType: 1,
            last_attended_date: 1,
            memberprofileImage: 1,
            status: 1,
            followup_notes: 1,
            userId: 1,
            last_membership: {
              $arrayElemAt: ["$membership_details", -1],
            },
          },
        },
        {
          $match: {
            last_membership: {
              $nin: [null],
            },
          },
        },
        {
          $lookup: {
            from: "buy_memberships",
            localField: "last_membership",
            foreignField: "_id",
            as: "memberships",
            pipeline: [
              {
                $project: {
                  expiry_date: {
                    $toDate: "$expiry_date",
                  },
                  membership_status: 1,
                  membership_name: 1,
                  membership_type: 1,
                },
              },
              {
                $match: {
                  membership_status: "Freeze",
                },
              },
            ],
          },
        },
        {
          $match: {
            memberships: {
              $exists: true,
              $ne: [],
            },
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
            program: 1,
            notes: 1,
            primaryPhone: 1,
            studentType: 1,
            last_attended_date: 1,
            memberprofileImage: 1,
            status: 1,
            notes: {
              $arrayElemAt: ["$followup_notes", -1],
            },
            memberships: 1,
          },
        },
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
  } catch (e) {
    res.send({ error: "frozen student data not fount" });
  }
};
