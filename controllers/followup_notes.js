const followUpNotes = require("../models/followup_notes");
const student = require("../models/addmember");
const user = require("../models/user");
const _ = require("lodash");
const moment = require("moment");
const memberModel = require("../models/addmember");

exports.createNote = async (req, res) => {
  let memberId = req.params.memberId;
  if (!memberId) {
    res.send({
      success: true,
      msg: "Member Id not found in the params!!",
    });
  }
  let payload = req.body;
  let createNotePayload = payload;
  let filter = {
    _id: memberId,
  };
  let studentInfo = await student.findById(filter).exec();
  if (!studentInfo) {
    return res.send({
      success: false,
      msg: "member not exists!!",
    });
  }
  createNotePayload.firstName = studentInfo.firstName;
  createNotePayload.lastName = studentInfo.lastName;
  (createNotePayload.userId = studentInfo.userId),
    (createNotePayload.memberId = studentInfo._id);
    createNotePayload.time = new Date().toLocaleTimeString([], {hour:"numeric", minute:"numeric", hour12:true});

  let createdNote = await followUpNotes.create(createNotePayload);
  console.log(createdNote)
  if (!createdNote) {
    res.send({
      success: false,
      msg: "Error while createign the note",
    });
  }

  let updateNoteIdIntoStudent = await student.findByIdAndUpdate(
    memberId,
    {
      $push: {
        followup_notes: createdNote._id,
      },
    },
    {
      new: true,
    }
  );
  if (!updateNoteIdIntoStudent) {
    res.send({
      success: false,
      msg: "Error while updating into member",
    });
  }
  res.send({
    success: true,
    msg: "Followup note has been created for the student",
    data: createdNote,
  });
};

exports.getNotesByUserId = async (req, res) => {
  var userId = req.params.userId;
  if (!userId) {
    res.send({
      success: true,
      msg: "Member Id not found in the params!!",
    });
  }
  let filter = {
    userId: userId,
  };
  let notes = await followUpNotes.find(filter);
  if (!notes) {
    res.send({
      success: true,
      msg: "Data not exists for this query!!",
    });
  }
  res.send({
    success: true,
    msg: "Please find the notes with userId",
    data: notes,
  });
};
exports.filterByNotes = async (req, res) => {
  try {
    let userId = req.params.userId;
    let noteType = req.params.NoteType;
    let filterBy = req.params.filterBy;
    var per_page = parseInt(req.params.per_page) || 10;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    let filter = {
      userId: userId,
      $or: [{ noteType }, { noteType: "Other" }],
    };
    if (!userId) {
      res.send({
        success: true,
        msg: "Member Id not found in the params!!",
      });
    }
    if (filterBy == "today") {
      await followUpNotes
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              noteType: 1,
              followupType: 1,
              note: 1,
              time: 1,
              createdAt: 1,
              date: { $dateFromString: { dateString: "$date" } },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $dayOfMonth: "$date" }, { $dayOfMonth: "$$NOW" }] },
                  { $eq: [{ $month: "$date" }, { $month: "$$NOW" }] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
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
    } else if (filterBy == "yesterday") {
      await followUpNotes
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              noteType: 1,
              followupType: 1,
              note: 1,
              time: 1,
              createdAt: 1,
              date: { $dateFromString: { dateString: "$date" } },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      { $dayOfMonth: "$date" },
                      {
                        $dayOfMonth: {
                          $subtract: ["$$NOW", 86400000],
                        },
                      },
                    ],
                  },
                  { $eq: [{ $month: "$date" }, { $month: new Date() }] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
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
    } else if (filterBy == "week") {
      await followUpNotes
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              noteType: 1,
              followupType: 1,
              note: 1,
              time: 1,
              createdAt: 1,
              date: { $dateFromString: { dateString: "$date" } },
            },
          },
          {
            $match: {
              $expr: {
                $or: { $eq: [{ $week: "$date" }, { $week: new Date() }] },
              },
            },
          },
          { $sort: { createdAt: -1 } },
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
    } else if (filterBy == "this_month") {
      await followUpNotes
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              noteType: 1,
              followupType: 1,
              note: 1,
              time: 1,
              createdAt: 1,
              date: { $dateFromString: { dateString: "$date" } },
            },
          },
          {
            $match: {
              $expr: {
                $eq: [{ $month: "$date" }, { $month: new Date() }],
              },
            },
          },
          { $sort: { createdAt: -1 } },
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
    } else if (filterBy == "last_month") {
      let last_month = new Date(moment().subtract(1, "M"));
      // console.log(last_month)
      // console.log(new Date())
      await followUpNotes
        .aggregate([
          { $match: filter },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              status: 1,
              noteType: 1,
              followupType: 1,
              note: 1,
              date: 1,
              time: 1,
              createdAt: 1,
              date: { $dateFromString: { dateString: "$date" } },
            },
          },
          {
            $match: {
              $expr: {
                $eq: [{ $month: last_month }, { $month: "$date" }],
              },
            },
          },
          { $sort: { createdAt: -1 } },
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
    } else {
      res.send({ msg: "data not found", success: false });
    }
  } catch (err) {
    throw new Error(err);
  }
};
exports.getNotesByMemberId = async (req, res) => {
  var memberId = req.params.memberId;
  if (!memberId) {
    res.send({
      success: true,
      msg: "Member Id not found in the params!!",
    });
  }
  let filter = {
    memberId: memberId,
  };
  let notes = await followUpNotes.find(filter);
  if (!notes) {
    res.send({
      success: true,
      msg: "Data not exists for this query!!",
    });
  }
  res.send({
    success: true,
    msg: "Please find the notes with userId",
    data: notes,
  });
};

exports.getNotesByNoteType = async (req, res) => {
  var memberId = req.params.memberId;
  if (!memberId) {
    res.send({
      success: true,
      msg: "Member Id not found in the params!!",
    });
  }
  let filter = {
    memberId: memberId,
  };
  let notes = await followUpNotes.find(filter);
  if (!notes) {
    res.send({
      success: true,
      msg: "Data not exists for this query!!",
    });
  }
  res.send({
    success: true,
    msg: "Please find the notes with userId",
    data: notes,
  });
};

exports.updateNote = async (req, res) => {
  let noteId = req.params.noteId;
  let { body: payload } = req;
  if (!payload) {
    res.json({
      success: false,
      msg: "Please check your input details!!",
    });
  }
  if (!noteId) {
    res.send({
      success: true,
      msg: "Note id not found in the params!!",
    });
  }
  let updatedNote = await followUpNotes.findByIdAndUpdate(noteId, payload, {
    new: true,
  });
  if (!updatedNote) {
    res.send({
      success: true,
      msg: "Data not exists for this query!!",
    });
  }
  res.send({
    success: true,
    msg: "The note has been updated!!",
    data: updatedNote,
  });
};

exports.removeNote = async (req, res) => {
  let noteId = req.params.noteId;
  if (!noteId) {
    res.send({
      success: true,
      msg: "Note id not found in the params!!",
    });
  }
  let deletedNote = await followUpNotes.findByIdAndDelete(noteId);
  if (!deletedNote) {
    res.send({
      success: true,
      msg: "Data not exists for this query!!",
    });
  }
  res.send({
    success: true,
    msg: "The note has been removed!!",
    data: {},
  });
};
