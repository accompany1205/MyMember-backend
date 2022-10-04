const taskSubFolder = require("../models/task_subfolder");
const taskFolder = require("../models/task_folder");
const tasks = require("../models/task");
const user = require("../models/user")
const cloudUrl = require("../gcloud/imageUrl");
const textMessage = require('../models/text_message');
const member =  require("../models/addmember")
const mongoose = require('mongoose');

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

    // let thisWeekBirthday = await member.aggregate([
    //   {
    //     $match: {
    //       $and: [
    //         { userId: '606aea95a145ea2d26e0f1aa' },
    //         { 'isRead': false  },
    //         { $expr: { $eq: [{ $week: '$dob' }, { $subtract: [{ $week: "$$NOW" },1]}] } },
    //       ]
    //     }
    //   },
    //   {
    //     $project: {
    //       id: 1,
    //       firstName: 1,
    //       lastName: 1,
    //       age: 1,
    //       dob: 1,
    //       memberprofileImage: 1,
    //       // week:{ $week: '$dob' },
    //       // nowWeek:{ $subtract: [{ $week: "$$NOW" },1]},
    //       isSeen: 1
    //     }
    //   }
    // ])
    // const d = new Date('2019-01-24T05:03:30.000Z');
    // console.log(d,'date')

   
    // let today = moment('2022-01-24T00:00:00+05:30').startOf('day');
    // console.log(today,'today',tomorrowMonth)

    let next2Month = moment().add(2, 'months');
    console.log(next2Month)
    let nextSixtyDays = await member.aggregate([
      {
        $match: {
          $and: [
            { userId: '606aea95a145ea2d26e0f1aa' },
            { 'isRead': false  },
            { $expr: { $eq: [{ $month: '$dob' }, { $month: new Date(next2Month) }] } }
          ]
        }
      },
      {
        $project: {
          id: 1,
          firstName: 1,
          lastName: 1,
          age: 1,
          dob: 1,
          memberprofileImage: 1,
          // month:{ $month: '$dob' },
          // nowMonth:{$subtract:[{$month:  new Date('2019-01-24T05:03:30.000Z')},1]},
          // nowWeek:{ $subtract: [{ $week: "$$NOW" },1]},
          isSeen: 1
        }
      }
    ])
  //   let today = moment().startOf('day');
  // // "2018-12-05T00:00:00.00
    
    

  // ("2018-12-05T23:59:59.999
    // let currDate = new Date().toISOString().slice(0, 10);
    // console.log(currDate, typeof currDate);
    let rest

    // let users = await user.findOne({_id: "6138893333c9482cb41d88d5"},{_id: 1,task_setting: 1,birthday_setting:1,chat_setting:1})
    // let notification ={}
    // if(users.task_setting){
    //   notification.task = [users]
    // }else{
    //   notification.task = []
    // }
    
  // const tomorrow  = new Date(); // The Date object returns today's timestamp
  // tomorrow.setDate(tomorrow.getDate() + 1);
  //   console.log(tomorrow,'date')
  // let todayBirthday = await member.find({ userId:req.params.userId,dob:tomorrow }, {id:1, dob: 1,firstName: 1})
//   let data = await member.aggregate([
//     {
//     $match: {
//       $and: [
//         {userId:req.params.userId},
//         // {'isSeen':null},
//         // { $expr: { $eq: [{ $dayOfMonth: '$dob' },{ $add: [{ $dayOfMonth: "$$NOW" },1] },]} }, 
//         // { $expr: { $eq: [{ $month: '$dob' },{ $month: '$$NOW' }] } }
//       ]
//   }
//   },
//   {
//     $project:{
//       // firstName:1,
//       // lastName:1,
//       // age:1,
//       today: {  $dayOfMonth: new Date() },
//       tomrow: { $add: [{ $dayOfMonth: new Date() },1] },
//   }
//   }
// ])
// let today = new Date()
// let tomorrow = moment(today,'YYYY-MM-DD').add(1);
// var now = new Date();
// var day = now.getDate();        // funny method name but that's what it is
// var month = now.getMonth() + 1;
// console.log(now,day,month,tomorrow)
// let today = moment();
// let tomorrow = moment().add(1,'days');
// let tomorrowBirthday = await member.aggregate([
//     {
//     $match: {
//       $and: [
//         {userId:req.params.userId},
//         {'isSeen':null},
//         { $expr: { $eq: [{ $dayOfMonth: '$dob' },{ $dayOfMonth: new Date(tomorrow)}]} }, 
//         { $expr: { $eq: [{ $month: '$dob' },{ $month: new Date(tomorrow) }] } }
//       ]
//   }
//   },
//   {
//     $project:{
//       firstName:1,
//       lastName:1,
//       age:1,
//   }
//   }
// ])
   
  //  let count  =  text_chat.filter((item)=> item.isSeen == 'false').length;

    res.send({ success: true, data: nextSixtyDays });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.seenTasks = async (req, res) => {
  try {
    const taskId = req.body.taskId;
    const textId = req.body.chatId;
    const memberId = req.body.memberId
    
       if(taskId != undefined || taskId.length > 0){
        const seenTasks = await tasks.updateOne(
          { _id: { $in: taskId }  },
          { $set: { isSeen: true } }
        );
        }
        if(memberId != undefined || memberId.length > 0){
        const seenMember = await member.updateOne(
          { _id: { $in: memberId }},
          { $set: { isSeen: "true" } }
        );
        }
        if(textId != undefined || textId.length > 0){
        const seenText = await textMessage.updateOne(
          { _id: { $in: textId} },
          { $set: { isSeen: "true" } }
        );
      }
    res.send({ success: true, msg: "notification seen successfully" });
    // console.log("updatetask", seenTasks,"updateText",seenText,"seenmember",seenMember);
    
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.seenRead = async (req, res) => {
  try {
    const taskId = req.body.taskId;
    const textId = req.body.chatId;
    const memberId = req.body.memberId
   
    
       if(taskId != undefined || taskId.length > 0){
        const seenTasks = await tasks.updateOne(
          { _id: { $in: taskId }  },
          { $set: { isRead: true,isSeen: false } }
        );
        }
        if(memberId != undefined || memberId.length > 0){
        const seenMember = await member.updateOne(
          { _id: { $in: memberId }},
          { $set: { isRead: true, isSeen: "false"  } }
        );
        console.log('data',seenMember)
        }
        if(textId != undefined || textId.length > 0){
        const seenText = await textMessage.updateOne(
          { _id: { $in: textId} },
          { $set: { isRead: true, isSeen: "false" } }
        );
      }
    res.send({ success: true, msg: "notification remove successfully" });
    // console.log("updatetask", seenTasks,"updateText",seenText,"seenmember",seenMember);
    
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
}

exports.notificationOnOFF = async (req, res) => {
  try{
    let task_setting = req.query.taskSetting
    let chat_setting = req.query.chatSetting
    let nextSixtyDays_birthday_setting = req.query.sixtyDaysBirthdaySetting
    let nextNintyDays_birthday_setting = req.query.nintyDaysBirthdaySetting
    let thisWeek_birthday_setting = req.query.thisWeekBirthdaySetting
    let thisMonth_birthday_setting = req.query.thisMonthBirthdaySetting
    let lastMonth_birthday_setting = req.query.lastMonthBirthdaySetting
    let event_notification_setting = req.query.eventNotificationSetting
    let seven_to_fourteen_setting = req.query.sevenToFourteenSetting
    let fifteen_to_thirty_setting = req.query.fifteenToThirtySetting
    let thirtyone_to_sixty_setting = req.query.thirtyoneToSixtySetting
    let sixtyone_plus_setting = req.query.sixtyonePlusSetting
    let expire_notification_setting = req.query.expireNotificationSetting
    let thirtydays_expire_notification_setting = req.query.thirtyDaysExpireNotificationSetting
    let sixtydays_expire_notification_setting = req.query.sixtyDaysExpireNotificationSetting
    let nintydays_expire_notification_setting = req.query.nintyDaysExpire_notification_setting
    let frozen_notification_setting = req.query.frozenNotificationSetting
    
    let query = {}
    if(task_setting != undefined){
      query.task_setting = task_setting
    }
    else if(chat_setting != undefined){
      query.chat_setting = chat_setting
    }
    else if(nextSixtyDays_birthday_setting != undefined){
      query.nextSixtyDays_birthday_setting = nextSixtyDays_birthday_setting
    }
    else if(nextNintyDays_birthday_setting != undefined){
      query.nextNintyDays_birthday_setting = nextNintyDays_birthday_setting
    }
    else if(thisWeek_birthday_setting != undefined){
      query.thisWeek_birthday_setting = thisWeek_birthday_setting
    }
    else if(thisMonth_birthday_setting != undefined){
      query.thisMonth_birthday_setting = thisMonth_birthday_setting
    }
    else if(lastMonth_birthday_setting != undefined){
      query.lastMonth_birthday_setting = lastMonth_birthday_setting
    }
    else if(event_notification_setting != undefined){
      query.event_notification_setting = Boolean(event_notification_setting)
    }
    else if(seven_to_fourteen_setting != undefined){
      query.seven_to_fourteen_setting = Boolean(seven_to_fourteen_setting)
    }
    else if(fifteen_to_thirty_setting != undefined){
      query.fifteen_to_thirty_setting = Boolean(fifteen_to_thirty_setting)
    }
    else if(thirtyone_to_sixty_setting != undefined){
      query.thirtyone_to_sixty_setting = Boolean(thirtyone_to_sixty_setting)
    } 
    else if(sixtyone_plus_setting != undefined){
      query.sixtyone_plus_setting = Boolean(sixtyone_plus_setting)
    } 
    else if(expire_notification_setting != undefined){
      query.expire_notification_setting = Boolean(expire_notification_setting)
    } 
    else if(thirtydays_expire_notification_setting != undefined){
      query.thirtydays_expire_notification_setting = Boolean(thirtydays_expire_notification_setting)
    } 
    else if(sixtydays_expire_notification_setting != undefined){
      query.sixtydays_expire_notification_setting = Boolean(sixtydays_expire_notification_setting)
    } 
    else if(nintydays_expire_notification_setting != undefined){
      query.nintydays_expire_notification_setting = Boolean(nintydays_expire_notification_setting)
    } 
    else if(frozen_notification_setting != undefined){
      query.frozen_notification_setting = Boolean(frozen_notification_setting)
    } 

    let userId =  req.params.userId
    const id = mongoose.Types.ObjectId(userId);
    console.log(query,id)
    let userNotificationUpdate = await user.updateOne({_id:id},{$set:query})
    console.log(userNotificationUpdate)
    res.send({ success: true, msg: "notification setting update successfully" });
  }catch(err){
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
}
