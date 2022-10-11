const textMessage = require('../models/text_message');
const member = require('../models/addmember');
const buymembership = require("../models/buy_membership")
const User = require('../models/user');
const tasks = require('../models/task')
const event = require("../models/appointment")
const location = require('../models/admin/settings/location');
const jwt = require('jsonwebtoken');
const ChatUser = require('../models/chat_user');
const Chat = require('../models/chat');
let moment = require("moment");

class SocketEngine {
  constructor(io) {
    this.sConnection = io;
    this.init();
  }

  async init() {
    //start listen
    var io = this.sConnection;
    this.sConnection.on('connection', function (socket) {
      socket.on('joinTextChatRoom', async (room) => {
        socket.join(room);
      });


      socket.on('leaveTextChatRoom', async (room) => {
        socket.leave(room);
      });

      socket.on('memberText', async (member) => {
        let { uid, userId } = member;
        let data = await textMessage.find({ $and: [{ userId: userId }, { uid: uid }] });
        io.to(userId).emit('memberTextList', data)
      });

      socket.on('alertGetTexts', async (getText) => {
        try {
          console.log(getText)
          const { userId, uid } = getText;
          const textList = await textMessage.find(getText);
          io.to(`${userId}${uid}`).emit('getText', textList);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('push-notification', async (userId) => {
        let notification = {}
        let lastMonth = moment().subtract(1, 'months');
        let nextSixtyDays = moment().add(2, 'months');
        let nextNintyDays = moment().add(3, 'months');
        let currDate = new Date().toISOString().slice(0, 10);
        let users = await User.findOne({ _id: userId }, {
          _id: 1, task_setting: 1, thisWeek_birthday_setting: 1, thisMonth_birthday_setting: 1, lastMonth_birthday_setting: 1, nextSixtyDays_birthday_setting: 1, nextNintyDays_birthday_setting: 1, chat_setting: 1, event_notification_setting: 1,
          thirtydays_expire_notification_setting_renewal: 1, sixtydays_expire_notification_setting_renewal: 1, nintydays_expire_notification_setting_renewal: 1
        })

        if (users.task_setting) {
          var todayTask = await tasks.find(
            {
              userId: userId,
              start: currDate,
              $or: [{ 'isRead': null }, { 'isRead': false }]
            },
            { id: 1, name: 1, start: 1, description: 1, isSeen: 1 }
          );

          var todayTask_count = todayTask.filter((item) => item.isSeen == false).length;
          notification.todayTaskCount = todayTask_count
          notification.tasks = todayTask
        } else {
          notification.todayTaskCount = 0
          notification.tasks = []
        }

        if (users.event_notification_setting) {
          var todayEvent = await event.find(
            {
              userId: userId,
              start: currDate,
              $or: [{ 'isRead': null }, { 'isRead': false }]
            },
            {
              id: 1, title: 1, start: 1, notes: 1, isSeen: 1
            }
          );

          var todayEvent_count = todayEvent.filter((item) => item.isSeen == false).length;
          notification.todayEventCount = todayEvent_count
          notification.event = todayEvent
        } else {
          notification.todayEventCount = 0
          notification.event = []
        }

        if (users.chat_setting) {
          let text_chat = await textMessage.aggregate([
            { "$match": { "$and": [{ userId: userId }, { 'isRead': false }, { 'isSent': false }] } },
            { "$addFields": { "uid": { $convert: { input: '$uid', to: 'objectId', onError: '', onNull: '' } } } },
            {
              "$lookup": {
                "from": "members",
                "localField": "uid",
                "foreignField": "_id",
                "as": "to"
              }
            },
            {
              $project: {
                id: 1,
                textContent: 1,
                time: 1,
                isSeen: 1,
                to: {
                  firstName: 1,
                  lastName: 1,
                  memberprofileImage: 1
                }
              }
            },
            { $sort: { time: -1 } }
          ])
          console.log("-->", text_chat)
          let chat_count = text_chat.filter((item) => item.isSeen == 'false').length;
          notification.chatCount = chat_count
          notification.chat = text_chat
        } else {
          notification.chatCount = 0
          notification.chat = []
        }

        if (users.nextSixtyDays_birthday_setting) {
          let nextSixtyDaysBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false },
                  { $expr: { $eq: [{ $month: '$dob' }, { $month: new Date(nextSixtyDays) }] } }
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
                isSeen: 1
              }
            }
          ])
          console.log(nextSixtyDaysBirthday)

          let nextSixtyDaysBirthday_count = nextSixtyDaysBirthday.filter((item) => item.isSeen == 'false').length;
          notification.nextSixtyDaysBirthdayCount = nextSixtyDaysBirthday_count
          notification.nextSixtyDaysBirthda = nextSixtyDaysBirthday
        } else {
          notification.nextSixtyDaysBirthdayCount = 0
          notification.nextSixtyDaysBirthda = []
        }

        if (users.nextNintyDays_birthday_setting) {
          let nextNintyDaysBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false },
                  { $expr: { $eq: [{ $month: '$dob' }, { $month: new Date(nextNintyDays) }] } }
                ]
              }
            },
            {
              $project: {
                id: 1,
                firstName: 1,
                lastName: 1,
                dob: 1,
                age: 1,
                memberprofileImage: 1,
                isSeen: 1
              }
            }
          ])
          console.log("next ninty", nextNintyDaysBirthday)

          let nextNintyDaysBirthday_count = nextNintyDaysBirthday.filter((item) => item.isSeen == 'false').length;
          notification.nextNintyDaysBirthdayCount = nextNintyDaysBirthday_count
          notification.nextNintyDaysBirthday = nextNintyDaysBirthday
        } else {
          notification.nextNintyDaysBirthdayCount = 0
          notification.nextNintyDaysBirthday = []
        }

        if (users.thisWeek_birthday_setting) {
          let thisWeekBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false },
                ]
              }
            },
            {
              $project: {
                _id: 1,
                afterSevenDays: {
                  $toDate: {
                    $dateToString: {
                      format: "%Y-%m-%d", date: {
                        $dateAdd:
                        {
                          startDate: "$$NOW",
                          unit: "day",
                          amount: 7
                        }
                      }
                    }
                  }
                },
                firstName: 1,
                lastName: 1,
                age: 1,
                dob: { $toDate: "$dob" },
                memberprofileImage: 1,
                isSeen: 1
              }
            },
            {
              $match: { dob: { $ne: null } }
            },
            {
              $project: {
                _id: 1,
                afterSevenDays: 1,
                firstName: 1,
                lastName: 1,
                age: 1,
                dob: 1,
                memberprofileImage: 1,
                isSeen: 1,
                dobMonth: { $month: "$dob" },
                sevenDaysMonth: { $month: "$afterSevenDays" },
                daydob: { $dayOfMonth: "$dob" },
                dayAfterSeven: { $dayOfMonth: "$afterSevenDays" }
              }
            },
            {
              $match: { $expr: { $eq: ["$dobMonth", "$sevenDaysMonth"] } }
            },
            {
              $project: {
                _id: 1,
                afterSevenDays: 1,
                firstName: 1,
                lastName: 1,
                age: 1,
                dob: 1,
                memberprofileImage: 1,
                isSeen: 1,
                dobMonth: { $month: "$dob" },
                sevenDaysMonth: { $month: "$afterSevenDays" },
                daydob: { $dayOfMonth: "$dob" },
                dayAfterSeven: { $dayOfMonth: "$afterSevenDays" },
                differencebtwdays: { $subtract: ["$dayAfterSeven", "$daydob"] }

              }
            },
            {
              $match: {
                $and: [{ differencebtwdays: { $lte: 8 } }, { differencebtwdays: { $gte: 0 } }]
              }
            }

          ])
          console.log("this week", thisWeekBirthday)

          let thisWeekBirthday_count = thisWeekBirthday.filter((item) => item.isSeen == 'false').length;
          notification.thisWeekBirthdayCount = thisWeekBirthday_count
          notification.thisWeekBirthday = thisWeekBirthday
        } else {
          notification.thisWeekBirthdayCount = 0
          notification.thisWeekBirthday = []
        }

        if (users.thisMonth_birthday_setting) {
          let thisMonthBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false },
                  { $expr: { $eq: [{ $month: '$dob' }, { $month: '$$NOW' }] } }
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
                isSeen: 1
              }
            }
          ])
          console.log("this month ", thisMonthBirthday)

          let thisMonthBirthday_count = thisMonthBirthday.filter((item) => item.isSeen == 'false').length;
          notification.thisMonthBirthdayCount = thisMonthBirthday_count
          notification.thisMonthBirthday = thisMonthBirthday
        } else {
          notification.thisMonthBirthdayCount = 0
          notification.thisMonthBirthday = []
        }

        if (users.lastMonth_birthday_setting) {
          let lastMonthBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false },
                  { $expr: { $eq: [{ $month: '$dob' }, { $month: new Date(lastMonth) }] } }
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
                isSeen: 1
              }
            }
          ])

          let lastMonthBirthday_count = lastMonthBirthday.filter((item) => item.isSeen == 'false').length;
          notification.lastMonthBirthdayCount = lastMonthBirthday_count
          notification.lastMonthBirthday = lastMonthBirthday
        } else {
          notification.lastMonthBirthdayCount = 0
          notification.lastMonthBirthday = []
        }
        if (users.thirtydays_expire_notification_setting_renewal) {
            let now = new Date();
            let todaysDate = moment(now).format('YYYY/MM/DD')
            const afterThirty = new Date(now.setDate(now.getDate() + 30));
            const thirtyDaysExpire = moment(afterThirty).format('YYYY/MM/DD');
            let thirty_days_expire = await buymembership.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { "$expiry_date": { "$eq": thirtyDaysExpire } }
                ]
              }
            },
            {
              $project: {
                studentInfo: 1
              }
            },
            { $unwind: "$studentInfo" },
            {
              $lookup:
              {
                from: "member",
                localField: "studentInfo",
                foreignField: "_id",
                as: "members",
                pipeline: [
                  {
                    $project: {
                      _id:1,
                      firstName: 1,
                      lastName: 1,
                      isSeen: 1
                    },
                  },
                ],
              }
            }
          ])
          console.log("-----",thirty_days_expire)

        }else {
          notification.thirtyDaysExpireNotificationSettingRenewalCount = 0
          notification.thirtyDaysExpireNotificationSettingRenewalCount = []
        }

        notification.count = eval(notification.lastMonthBirthdayCount + notification.thisMonthBirthdayCount + notification.thisWeekBirthdayCount + notification.nextNintyDaysBirthdayCount + notification.nextSixtyDaysBirthdayCount + notification.chatCount + notification.todayTaskCount + notification.todayEventCount)
        io.to(userId).emit('getNotification', notification)
      });
      // in the userObj we need 3 parameter userId for task get and (msg to) for chat 
      socket.on('textAlertWebhook', async (uidObj) => {
        let uid = uidObj.uid;
        let { userId } = await member.findOne({ _id: uid });
        console.log(uidObj, userId);
        io.to(userId).emit('getAlertText', uidObj);
        //socket.emit("getAlertText", "Hello Message!");
      });

      socket.on('locationUpdate', async (locationObj) => {
        try {
          console.log(locationObj);
          let { userId, access_location_list } = locationObj;
          await User.updateOne(
            { _id: userId },
            { $set: { isAccessLocations: true, locations: access_location_list } }
          );
          User.findOne({ _id: userId }, async (err, data) => {
            if (err) {
              console.log(err);
            }
            let locationData = await User.find({ _id: data.locations }).populate(
              'default_location'
            );
            let default_locationData = await location.find({ _id: data.default_location });
            //let current_locationData = await User.findOne({ locationName: req.body.locationName });
            const {
              _id,
              username,
              password,
              name,
              email,
              role,
              logo,
              bussinessAddress,
              country,
              state,
              city
            } = data;
            var updatedData = {
              success: true,
              data: {
                _id,
                //locationName: current_locationData.locationName,
                default_locationData,
                locations: [...locationData, ...default_locationData],
                username,
                password,
                name,
                email,
                role,
                logo,
                bussinessAddress,
                country,
                state,
                city,
                isAccessLocations: true
              }
            };
            console.log(updatedData);
            io.to(userId).emit('localStorageData', updatedData);
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('createRoom', async ({ email, roomId }) => {
        let user = await ChatUser.findOne({ email }, { roomId: 1 });
        if (user && user.roomId) {
          socket.join(user.roomId);
          socket.emit('updatedRoomId', user.roomId);
        }
        else socket.join(roomId);
      });

      socket.on('getChatbotUsers', async ({ currentUserEmail, schoolId }) => {
        try {
          let chatbotUsers = await ChatUser.find({ schoolId }).populate('chats');
          chatbotUsers = chatbotUsers.filter((user) => user.email !== currentUserEmail);
          io.emit('chatbotUsers', chatbotUsers);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('getRoomChats', async (roomId) => {
        try {
          const chatbotChats = await Chat.find({ roomId }).sort({ timestamp: 1 });
          io.emit('chatbotChats', chatbotChats);
        } catch (err) {
          console.log(err);
        }
      });

      // socket to send message
      socket.on('message', async (body) => {
        const {
          email,
          fullName,
          phone: primaryPhone,
          roomId,
          message,
          timestamp,
          schoolId,
          chatURL
        } = body;
        try {
          const chat = new Chat({ email, roomId, message, timestamp, schoolId, chatURL });
          const { _id: chatId } = await chat.save();
          await ChatUser.updateOne(
            { email },
            {
              email,
              fullName,
              primaryPhone,
              roomId,
              schoolId,
              $push: { chats: chatId },
              createdAt: timestamp
            },
            { upsert: true }
          );

          const chatbotChats = await Chat.find({ roomId }).sort({ timestamp: 1 });
          io.to(roomId).emit('message', { email, roomId, message, timestamp });
          io.emit('chatbotChats', chatbotChats);
        } catch (error) {
          console.log(error);
        }
      });
    });
  }
}

module.exports = SocketEngine;
