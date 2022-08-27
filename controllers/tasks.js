const taskSubFolder = require("../models/task_subfolder");
const taskFolder = require("../models/task_folder");
const tasks = require("../models/task");
const cloudUrl = require("../gcloud/imageUrl");
const textMessage = require('../models/text_message');

exports.Create = async (req, res) => {
  const Task = req.body;
  let userId = req.params.userId;
  let subfolderId = req.params.subfolderId;
  Task.userId = userId;
  Task.subfolderId = subfolderId;
  let dateRanges = Task.repeatedDates;
  try {
    let allTasks = [];
    if (dateRanges.length > 1) {
      for (let dates in dateRanges) {
        let newTask = {
          ...Task,
          start: dateRanges[dates],
          end: dateRanges[dates],
          repeatedDates: dateRanges,
        };
        allTasks.push(newTask);
      }
      let resp = await tasks.insertMany(allTasks);
      let rest = await [...resp.map((element) => element._id)];
      if (rest.length) {
        taskSubFolder.findByIdAndUpdate(
          subfolderId,
          {
            $push: { tasks: rest },
          },
          (err, data) => {
            if (err) {
              res.send({
                msg: "Task not added in folder",
                success: false,
              });
            } else {
              res.send({ success: true, msg: "Task added!" });
            }
          }
        );
      } else {
        res.send({ success: false, msg: "Task not created!" });
      }
    } else {
      const task = new tasks(Task);
      task.save((err, taskData) => {
        if (err) {
          res.send({ msg: "Task is not added", success: err });
        } else {
          taskSubFolder.findByIdAndUpdate(
            subfolderId,
            {
              $push: { tasks: taskData._id },
            },
            (err, data) => {
              if (err) {
                res.send({
                  msg: "task not added in folder",
                  success: false,
                });
              } else {
                res.send({ success: true, msg: "Task added!" });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.remove = (req, res) => {
  const taskId = req.params.taskId;
  try {
    tasks.findOneAndRemove({ _id: taskId }, (err, data) => {
      if (err) {
        res.send({ msg: "task is not removed", success: false });
      } else {
        taskSubFolder.updateOne(
          { tasks: taskId },
          { $pull: { tasks: taskId } },
          (err, temp) => {
            if (err) {
              res.send({
                msg: "task not removed",
                success: false,
              });
            } else {
              res.send({
                msg: "task removed successfully",
                success: true,
              });
            }
          }
        );
      }
    });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.tasksUpdate = async (req, res) => {
  try {
    var taskData = req.body;
    const taskId = req.params.taskId;
    const promises = [];
    if (req.files) {
      req.files.map((file) => {
        promises.push(cloudUrl.imageUrl(file));
      });
      const docs = await Promise.all(promises);
      taskData.document = docs;
    }
    tasks
      .updateOne({ _id: taskId }, { $set: taskData })
      .exec(async (err, data) => {
        if (err) {
          res.send({
            msg: err,
            success: false,
          });
        } else {
          res.send({
            msg: "task updated successfully",
            success: true,
          });
        }
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.todayTask = async (req, res) => {
  const userId = req.params.userId;
  const date = new Date();

  try {
    let cDate = ("0" + date.getDate()).slice(-2);
    let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
    let cYear = date.getFullYear();
    let currentDate = `${cYear}-${cMonth}-${cDate}`;
    console.log(currentDate);
    tasks
      .find({
        start: currentDate,
        userId: userId,
      })
      .populate({
        path: "subfolderId",
        select: "subFolderName",

        populate: {
          select: "folderName",
          path: "folderId",
          model: "taskfolder",
        },
      })
      .then((result) => {
        res.send({ success: true, data: result });
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.taskFilter = async (req, res) => {
  const userId = req.params.userId;

  let { filter, byTime } = req.body;
  filter = filter ? filter : {};
  filter.userId = userId;
  const date = new Date();

  try {
    if (byTime === "Today") {
      let cDate = ("0" + date.getDate()).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cYear}-${cMonth}-${cDate}`;
      filter.start = currentDate;
      console.log(filter);
      tasks
        .find(filter)
        .populate({
          path: "subfolderId",
          select: "subFolderName",

          populate: {
            select: "folderName",
            path: "folderId",
            model: "taskfolder",
          },
        })
        .then((result) => {
          res.send({ success: true, data: result });
        })
        .catch((err) => {
          res.send(err);
        });
    } else if (byTime === "Tomorrow") {
      let cDate = ("0" + (date.getDate() + 1)).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cYear}-${cMonth}-${cDate}`;
      filter.start = currentDate;
      console.log(filter);
      tasks
        .find(filter)
        .populate({
          path: "subfolderId",
          select: "subFolderName",

          populate: {
            select: "folderName",
            path: "folderId",
            model: "taskfolder",
          },
        })
        .then((result) => {
          res.send({ success: true, data: result });
        })
        .catch((err) => {
          res.send(err);
        });
    } else if (byTime === "This Week") {
      console.log(filter);
      tasks
        .aggregate([
          {
            $match: filter,
          },
          {
            $match: {
              $expr: {
                $eq: [{ $week: { $toDate: "$start" } }, { $week: "$$NOW" }],
              },
            },
          },
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
            });
          } else {
            res.send({ success: true, memberdata });
          }
        });
    } else if (byTime === "This Month") {
      tasks
        .aggregate([
          {
            $match: filter,
          },
          {
            $match: {
              $expr: {
                $eq: [{ $month: { $toDate: "$start" } }, { $month: "$$NOW" }],
              },
            },
          },
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
            });
          } else {
            if (err) {
              res.send({
                error: err,
              });
            } else {
              res.send({ success: true, memberdata });
            }
          }
        });
    } else {
      tasks
        .find(filter)
        .populate({
          path: "subfolderId",
          select: "subFolderName",

          populate: {
            select: "folderName",
            path: "folderId",
            model: "taskfolder",
          },
        })
        .then((result) => {
          res.send({ success: true, data: result });
        })
        .catch((err) => {
          res.send(err);
        });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
let moment = require("moment");
const { isIsoDate } = require("@hapi/joi/lib/common");

exports.notificationTodayTask = async (req, res) => {
  try {
    let currDate = new Date().toISOString().slice(0, 10);
    console.log(currDate, typeof currDate);
    // let todayTask = await tasks.find(
    //   {
    //     userId: req.params.userId,
    //     start: currDate,
    //     $or:[ 
    //         {'isSeen':null}, {'isSeen':false} 
    //     ]
    //   },
    //   {
    //     name: 1,
    //     start: 1,
    //   }
    // );
    let todayTask =  await textMessage.aggregate([
      {"$match": {"$and":[{ userId:"606aea95a145ea2d26e0f1aa" },{'isSeen':null} ]}},
      { "$addFields": { "uid": { "$toObjectId": "$uid" }}},
      {
        "$lookup": {
          "from": "members",
          "localField": "uid",
          "foreignField": "_id",
          "as": "to"
        }
   },
   {
      $project:{
          id:1,
          textContent:1,
          to:{
            firstName:1,
            lastName:1
          }
        }
   }
  ])

    res.send({ success: true, taskCount: todayTask.length, data: todayTask });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.seenTasks = async (req, res) => {
  try {
    const taskIds = req.body.taskIds;
    const textIds = req.body.chatIds;
  
    const seenTasks = await tasks.updateMany(
      { _id: { $in: taskIds } },
      { $set: { isSeen: true } }
    );
    const seenText = await textMessage.updateMany(
      { _id: { $in: textIds } },
      { $set: { isSeen: "true" } }
    );
    console.log("updatetask", seenTasks,"updateText",seenText);
    res.send({ success: true, msg: "task and text seen successfully" });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
