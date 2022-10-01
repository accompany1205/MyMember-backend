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

// exports.forActive = async (req, res) => {
//   const active = await student.aggregate([
//     {
//       $match: {
//         userId: "606aea95a145ea2d26e0f1ab"
//       }
//     },
//     {
//       $project: {
//         membership_details: 1,
//         status: 1,
//       },
//     },
//     {
//       $match: {
//         membership_details: {
//           $ne: []
//         }
//       }
//     },
//     {
//       $unwind: "$membership_details"
//     },
//     {
//       $lookup: {
//         from: "buy_memberships",
//         localField: "membership_details",
//         foreignField: "_id",
//         as: "membership",
//       }
//     },
//     {
//       $project: {
//         _id: 1,
//         membership_id: { $first: "$membership._id" },
//         status: 1,
//         membership_status: { $first: "$membership.membership_status" },
//         expiry_date: { $toDate: { $first: "$membership.expiry_date" } }
//       }
//     },
//     {
//       $match: {
//         $or: [{ membership_status: { $eq: "Freeze" } }, { membership_status: { $eq: "Active" } }]
//       }
//     },
//     {
//       $project: {
//         _id: 1,
//         membership_id: 1,
//         status: 1,
//         membership_status: 1,
//         expiry_date: 1,
//         isExpired: {
//           $cond: {
//             if: { $lte: ["$expiry_date", new Date()] },
//             then: true,
//             else: false
//           }
//         }
//       }
//     }

//   ])
//   const uniqueIds = {};
//   active.forEach(element => {
//     const isDuplicate = uniqueIds[element._id]
//     if (!isDuplicate) {
//       uniqueIds[element._id] = element
//     }
//   })
//   const uniqData = Object.values(uniqueIds)
//   let array = []
//   for (let i of uniqData) {
//     let obj = { _id: "", data: [] }
//     obj._id = i._id;
//     for (let j of active) {
//       if (obj._id.toString() === j._id.toString()) {
//         obj.data.push(j.membership_status)
//       }
//     }
//     array.push(obj)
//   }
//   for (let i = 0; i < array.length; i++) {
//     if ((array[i].data).includes("Freeze")) {
//       await student.updateOne({ _id: array[i]._id }, { $set: { status: "Freeze" } })
//     } else if ((array[i].data).includes("Active") && !(array[i].data).includes("Freeze")) {
//       await student.updateOne({ _id: array[i]._id }, { $set: { status: "Active" } })
//     }
//   }
// }


// exports.forCheck = async (req, res) => {
//   const expired_LastaMembership = await student.aggregate([
//     {
//       $match: {
//         userId: "606aea95a145ea2d26e0f1ab"
//       }
//     },
//     {
//       $project: {
//         membership_details: 1,
//         status: 1,
//       },
//     },
//     {
//       $match: {
//         membership_details: {
//           $ne: []
//         }
//       }
//     },
//     {
//       $unwind: "$membership_details"
//     },
//     {
//       $lookup: {
//         from: "buy_memberships",
//         localField: "membership_details",
//         foreignField: "_id",
//         as: "membership",
//       },
//     },
//     {
//       $project: {
//         membership_id: { $first: "$membership._id" },
//         status: 1,
//         membership_status: { $first: "$membership.membership_status" },
//         expiry_date: { $toDate: { $first: "$membership.expiry_date" } }
//       }
//     },
//     {
//       $project: {
//         membership_id: 1,
//         status: 1,
//         membership_status: 1,
//         expiry_date: 1,
//         isExpired: {
//           $cond: {
//             if: { $lte: ["$expiry_date", new Date()] },
//             then: true,
//             else: false
//           }
//         }
//       }
//     }
//   ]);
//   let buy_members = []
//   for (let i of expired_LastaMembership) {
//     if (i.isExpired === true) {
//       buy_members.push(i)
//     }
//   }
//   for (let i of buy_members) {
//     await buymembership.updateOne({ _id: i.membership_id.toString() }, { $set: { membership_status: "Expired" } })
//   }
//   const uniqueIds = {};
//   expired_LastaMembership.forEach(element => {
//     const isDuplicate = uniqueIds[element._id]
//     if (!isDuplicate) {
//       uniqueIds[element._id] = element
//     }
//   })
//   const uniqData = Object.values(uniqueIds)
//   let array = []
//   for (let i of uniqData) {
//     let obj = { _id: "", data: [] }
//     obj._id = i._id;
//     for (let j of expired_LastaMembership) {
//       if (obj._id.toString() === j._id.toString()) {
//         obj.data.push(j.membership_status)
//       }
//     }
//     array.push(obj)
//   }
//   for (let i = 0; i < array.length; i++) {
//     if ((array[i].data).includes("Expired") && !(array[i].data).includes("Active")) {
//       await student.updateOne({ _id: array[i]._id.toString() }, { $set: { status: "Expired" } })
//     } else if ((array[i].data).includes("Terminated")) {
//       await student.updateOne({ _id: array[i]._id.toString() }, { $set: { status: "Expired" } })
//     }
//   }
// }



async function renewalDaysData(userId, per_page, page_no, studentType, lte, gt, status) {
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const filter =
    userId && studentType
      ? {
        userId,
        studentType,
      }
      : {
        userId,
      };


  let data = await buymembership.aggregate([

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
    // {
    //   $match: {
    //     days_till_Expire: {
    //       $lte: lte,
    //       $gt: gt,
    //     },
    //   },
    // },
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
              primaryPhone: 1,
              street: 1,
              town: 1,
              state: 1,
              zipPostalCode: 1,
              email: 1,
              createdAt: 1
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
              time: 1,
              note: 1,
              date: 1,
              createdAt: 1,
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
        primaryPhone: 1,
        street: 1,
        town: 1,
        state: 1,
        zipPostalCode: 1,
        email: 1,
        notes: {
          $arrayElemAt: ["$followup_notes", -1],
        },
      },
    },
    // {
    //   $group: {
    //     _id: "$studentInfo",
    //     no_of_Memberships: {
    //       $sum: 1,
    //     },
    //     primaryPhone: {
    //       $first: "$members.primaryPhone",
    //     },
    //     street: {
    //       $first: "$members.street",
    //     },
    //     town: {
    //       $first: "$members.town",
    //     },
    //     state: {
    //       $first: "$members.state",
    //     },
    //     zipPostalCode: {
    //       $first: "$members.zipPostalCode",
    //     },
    //     email: {
    //       $first: "$members.email",
    //     },
    //     firstName: {
    //       $first: "$members.firstName",
    //     },
    //     lastName: {
    //       $first: "$members.lastName",
    //     },
    //     notes: {
    //       $first: "$notes",
    //     },
    //     program: {
    //       $first: "$members.program",
    //     },
    //     primaryPhone: {
    //       $first: "$members.primaryPhone",
    //     },
    //     studentType: {
    //       $first: "$members.studentType",
    //     },
    //     last_attended_date: {
    //       $first: "$members.last_attended_date",
    //     },
    //     memberprofileImage: {
    //       $first: "$members.memberprofileImage",
    //     },
    //     status: {
    //       $first: "$members.status",
    //     },
    //     memberships: {
    //       $push: {
    //         membership_name: "$membership_name",
    //         membership_type: "$membership_type",
    //         membership_status: "$membership_status",
    //         expiry_date: "$expiry_date",
    //         days_till_Expire: "$days_till_Expire",
    //         whenFreeze: "$whenFreeze",
    //       },
    //     },
    //   },
    // },
    { $match: { status: { $eq: status } } },
    {
      $facet: {
        paginatedResults: [
          { $skip: pagination.skip },
          { $limit: pagination.limit },
        ],

      },
    },
  ])

  data = data[0].paginatedResults;
  // data.sort((a, b) => {
  //   return a.notes.createdAt - b.notes.createdAt
  // })
  return data;
}

async function realData(status, data) {
  const finalData = []
  const expireData = data.map((ele) => {
    if (ele.status === status) {
      finalData.push(ele)
    }
  })
  return finalData
}
async function expireFreezeData(userId, per_page, page_no, studentType, lte, gt, status) {
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const filter =
    userId && studentType
      ? {
        userId,
        studentType,
      }
      : {
        userId,
      };


  let data = await buymembership.aggregate([

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
    // {
    //   $match: {
    //     days_till_Expire: {
    //       $lte: lte,
    //       $gt: gt,
    //     },
    //   },
    // },
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
              primaryPhone: 1,
              street: 1,
              town: 1,
              state: 1,
              zipPostalCode: 1,
              email: 1,
              createdAt: 1
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
              time: 1,
              note: 1,
              date: 1,
              createdAt: 1,
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
        primaryPhone: 1,
        street: 1,
        town: 1,
        state: 1,
        zipPostalCode: 1,
        email: 1,
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
        primaryPhone: {
          $first: "$members.primaryPhone",
        },
        street: {
          $first: "$members.street",
        },
        town: {
          $first: "$members.town",
        },
        state: {
          $first: "$members.state",
        },
        zipPostalCode: {
          $first: "$members.zipPostalCode",
        },
        email: {
          $first: "$members.email",
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
    { $match: { status: { $eq: status } } },
    { $sort: { firstName: 1 } },
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
  ]);


  return data;
}

exports.all_data_std = async (req, res) => {
  let userId = req.params.userId;
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  const studentType = req.query.studentType;
  if (req.params.multiple_data === "30") {
    let data = await expireFreezeData(userId, per_page, page_no, studentType, 30, 0, "Active")
    let finalData = data[0].paginatedResults;
    let arr = []
    for (let i of finalData) {
      for (let j = 0; j < i.memberships.length; j++) {
        var a = i.memberships[0].days_till_Expire
        if (a > i.memberships[j].days_till_Expire && a > 0) {
          a = i.memberships[j].days_till_Expire
        }
      }
      if (a >= 0 && a <= 30) {
        arr.push(i)
      }
    }
    return res.send({
      data: arr,
      totalCount: arr.length,
      success: true,
    });
  } else if (req.params.multiple_data === "60") {
    let data = await expireFreezeData(userId, per_page, page_no, studentType, 30, 0, "Active")
    let finalData = data[0].paginatedResults;
    let arr = []
    for (let i of finalData) {
      for (let j = 0; j < i.memberships.length; j++) {
        var a = i.memberships[0].days_till_Expire
        if (a > i.memberships[j].days_till_Expire && a > 0) {
          a = i.memberships[j].days_till_Expire
        }
      }
      if (a >= 30 && a <= 60) {
        arr.push(i)
      }
    }
    return res.send({
      data: arr,
      totalCount: arr.length,
      success: true,
    });
  } else if (req.params.multiple_data === "90") {
    let data = await expireFreezeData(userId, per_page, page_no, studentType, 30, 0, "Active")
    let finalData = data[0].paginatedResults;
    let arr = []
    for (let i of finalData) {
      for (let j = 0; j < i.memberships.length; j++) {
        var a = i.memberships[0].days_till_Expire
        if (a > i.memberships[j].days_till_Expire && a > 0) {
          a = i.memberships[j].days_till_Expire
        }
      }
      if (a >= 60 && a <= 90) {
        arr.push(i)
      }
    }
    return res.send({
      data: arr,
      totalCount: arr.length,
      success: true,
    });


  } else if (req.params.multiple_data === "frozenmembership") {
    let data = await expireFreezeData(userId, per_page, page_no, studentType, 30, 0, "Freeze")
    let finalData = data[0].paginatedResults;
    return res.send({
      data: finalData,
      totalCount: data[0].totalCount[0].count,
      success: true,
    });
    // try {
    //   let userId = req.params.userId;
    //   var per_page = parseInt(req.params.per_page) || 5;
    //   var page_no = parseInt(req.params.page_no) || 0;
    //   var pagination = {
    //     limit: per_page,
    //     skip: per_page * page_no,
    //   };
    //   const studentType = req.query.studentType;
    //   const filter =
    //     userId && studentType
    //       ? {
    //         userId,
    //         studentType,
    //       }
    //       : {
    //         userId,
    //       };
    //   student
    //     .aggregate([
    //       { $match: { userId: userId } },

    //       {
    //         $project: {
    //           firstName: 1,
    //           lastName: 1,
    //           program: 1,
    //           primaryPhone: 1,
    //           studentType: 1,
    //           last_attended_date: 1,
    //           memberprofileImage: 1,
    //           status: 1,
    //           followup_notes: 1,
    //           userId: 1,
    //           primaryPhone: 1,
    //           street: 1,
    //           town: 1,
    //           state: 1,
    //           zipPostalCode: 1,
    //           email: 1,
    //           last_membership: {
    //             $arrayElemAt: ["$membership_details", -1],
    //           },
    //         },
    //       },
    //       {
    //         $match: {
    //           last_membership: {
    //             $nin: [null],
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "buy_memberships",
    //           localField: "last_membership",
    //           foreignField: "_id",
    //           as: "memberships",
    //           pipeline: [
    //             {
    //               $project: {
    //                 expiry_date: {
    //                   $toDate: "$expiry_date",
    //                 },
    //                 membership_status: 1,
    //                 membership_name: 1,
    //                 membership_type: 1,
    //               },
    //             },
    //             {
    //               $match: {
    //                 membership_status: "Freeze",
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $match: {
    //           memberships: {
    //             $exists: true,
    //             $ne: [],
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "followupnotes",
    //           localField: "followup_notes",
    //           foreignField: "_id",
    //           as: "followup_notes",
    //           pipeline: [
    //             {
    //               $project: {
    //                 note: 1,
    //                 date: 1,
    //                 day: { $dayOfMonth: "$createdAt" },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $project: {
    //           firstName: 1,
    //           lastName: 1,
    //           program: 1,
    //           notes: 1,
    //           primaryPhone: 1,
    //           studentType: 1,
    //           last_attended_date: 1,
    //           memberprofileImage: 1,
    //           status: 1,
    //           primaryPhone: 1,
    //           street: 1,
    //           town: 1,
    //           state: 1,
    //           zipPostalCode: 1,
    //           email: 1,
    //           notes: {
    //             $arrayElemAt: ["$followup_notes", -1],
    //           },
    //           memberships: 1,
    //         },
    //       },
    //       { $match: { notes: { $ne: null } } },
    //       {
    //         $facet: {
    //           paginatedResults: [
    //             { $skip: pagination.skip },
    //             { $limit: pagination.limit },
    //           ],

    //         },
    //       },
    //     ])
    //     .exec((err, memberdata) => {
    //       if (err) {
    //         res.send({
    //           error: err,
    //         });
    //       } else {
    //         let data = memberdata[0].paginatedResults;
    //         data.sort((a, b) => {
    //           return a.notes.createdAt - b.notes.createdAt
    //         })

    //         return res.send({
    //           data: data,
    //           totalCount: data.length,
    //           success: true,
    //         });

    //       }
    //     });
    // } catch (e) {
    //   res.send({ error: "frozen student data not fount" });
    // }
  } else if (req.params.multiple_data === "expired") {
    let data = await expireFreezeData(userId, per_page, page_no, studentType, 30, 0, "Expired")
    let finalData = data[0].paginatedResults;
    // finalData.sort((a, b) => {
    //   return a.no_of_Memberships - b.no_of_Memberships
    // })
    return res.send({
      data: finalData,
      totalCount: data[0].totalCount[0].count,
      success: true,
    });
  }

}

// if (ele.status === "Expired") {
//

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
                  primaryPhone: 1,
                  street: 1,
                  town: 1,
                  state: 1,
                  zipPostalCode: 1,
                  email: 1,
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
                  time: 1,
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
            primaryPhone: 1,
            street: 1,
            town: 1,
            state: 1,
            zipPostalCode: 1,
            email: 1,
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
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            street: {
              $first: "$members.street",
            },
            town: {
              $first: "$members.town",
            },
            state: {
              $first: "$members.state",
            },
            zipPostalCode: {
              $first: "$members.zipPostalCode",
            },
            email: {
              $first: "$members.email",
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
                  primaryPhone: 1,
                  street: 1,
                  town: 1,
                  state: 1,
                  zipPostalCode: 1,
                  email: 1
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
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            street: {
              $first: "$members.street",
            },
            town: {
              $first: "$members.town",
            },
            state: {
              $first: "$members.state",
            },
            zipPostalCode: {
              $first: "$members.zipPostalCode",
            },
            email: {
              $first: "$members.email",
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
                  primaryPhone: 1,
                  street: 1,
                  town: 1,
                  state: 1,
                  zipPostalCode: 1,
                  email: 1,
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
            primaryPhone: {
              $first: "$members.primaryPhone",
            },
            street: {
              $first: "$members.street",
            },
            town: {
              $first: "$members.town",
            },
            state: {
              $first: "$members.state",
            },
            zipPostalCode: {
              $first: "$members.zipPostalCode",
            },
            email: {
              $first: "$members.email",
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
            primaryPhone: 1,
            street: 1,
            town: 1,
            state: 1,
            zipPostalCode: 1,
            email: 1,
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
            primaryPhone: 1,
            street: 1,
            town: 1,
            state: 1,
            zipPostalCode: 1,
            email: 1,
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
