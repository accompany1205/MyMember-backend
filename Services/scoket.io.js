const textMessage = require('../models/text_message');
const member = require('../models/addmember');
const User = require('../models/user');
const tasks = require('../models/task')
const location = require('../models/admin/settings/location');
const jwt = require('jsonwebtoken');
const ChatUser = require('../models/chat_user');
const Chat = require('../models/chat');

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
        let tomorrow = moment().add(1, 'days');
        let lastMonth = moment().subtract(1, 'months');
        let currDate = new Date().toISOString().slice(0, 10);
        let users = await user.findOne({_id: userId},{_id: 1,task_setting: 1,today_birthday_setting:1,tomorrow_birthday_setting:1,thisWeek_birthday_setting:1,thisMonth_birthday_setting:1,lastMonth_birthday_setting:1,chat_setting:1})
      
        if(users.task_setting){
        var todayTask = await tasks.find(
          {
            userId: userId,
            start: currDate,
            $or: [{ 'isRead': null }, { 'isRead': false }]
          },
          { id: 1, name: 1, start: 1, description: 1, isSeen: 1 }
        );
          
        var todayTask_count = todayTask.filter((item)=> item.isSeen == false).length;
        notification.todayTaskCount =  todayTask_count
        notification.tasks = todayTask
        }else{
          notification.todayTaskCount =  ""
          notification.tasks = []
        }
        
        if(users.chat_setting){
        let text_chat = await textMessage.aggregate([
          { "$match": { "$and": [{ userId: userId }, { 'isRead': false  },{ 'isSent': false  }] } },
          { "$addFields": { "uid": {$convert: {input: '$uid', to : 'objectId', onError: '',onNull: ''}} } },
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
        let chat_count = text_chat.filter((item)=> item.isSeen == 'false').length;
          notification.chatCount = chat_count
          notification.chat =  text_chat
        }else{
          notification.chatCount = ""
          notification.chat =  []
        }

        if(users.today_birthday_setting){
        let todayBirthday = await member.aggregate([
          {
            $match: {
              $and: [
                { userId: userId },
                { 'isRead': false  },
                { $expr: { $eq: [{ $dayOfMonth: '$dob' }, { $dayOfMonth: '$$NOW' }] } },
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

        let todayBirthday_count = todayBirthday.filter((item)=> item.isSeen == 'false').length;
        notification.todayBirthdayCount = todayBirthday_count
        notification.todayBirthday = todayBirthday
        }else{
        notification.todayBirthdayCount = ""
        notification.todayBirthday = []
        }

        if(users.tomorrow_birthday_setting){
        let tomorrowBirthday = await member.aggregate([
          {
            $match: {
              $and: [
                { userId: userId },
                { 'isRead': false  },
                { $expr: { $eq: [{ $dayOfMonth: '$dob' }, { $dayOfMonth: new Date(tomorrow) }] } },
                { $expr: { $eq: [{ $month: '$dob' }, { $month: new Date(tomorrow) }] } }
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

        let tomorrowBirthday_count = tomorrowBirthday.filter((item)=> item.isSeen == 'false').length;
        notification.tomorrowBirthdayCount = tomorrowBirthday_count
        notification.tomorrowBirthday = tomorrowBirthday
        }else{
        notification.tomorrowBirthdayCount = ""
        notification.todayBirthday = []
        }

        if(users.thisWeek_birthday_setting){
          let thisWeekBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false  },
                  { $expr: { $eq: [{ $week: '$dob' }, { $subtract: [{ $week: "$$NOW" },1]}] } },
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

        let thisWeekBirthday_count = thisWeekBirthday.filter((item)=> item.isSeen == 'false').length;
        notification.thisWeekBirthdayCount = thisWeekBirthday_count
        notification.thisWeekBirthday = thisWeekBirthday
        }else{
          notification.thisWeekBirthdayCount = ""
          notification.thisWeekBirthday = []
        }

        if(users.thisMonth_birthday_setting){
          let thisMonthBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false  },
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

        let thisMonthBirthday_count = thisMonthBirthday.filter((item)=> item.isSeen == 'false').length;
        notification.thisMonthBirthdayCount = thisMonthBirthday_count
        notification.thisMonthBirthday = thisMonthBirthday
        }else{
          notification.thisMonthBirthdayCount = ""
          notification.thisMonthBirthday = []
        }

        if(users.lastMonth_birthday_setting){
          let lastMonthBirthday = await member.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { 'isRead': false  },
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

        let lastMonthBirthday_count = lastMonthBirthday.filter((item)=> item.isSeen == 'false').length;
        notification.lastMonthBirthdayCount = lastMonthBirthday_count
        notification.lastMonthBirthday = lastMonthBirthday
        }else{
          notification.lastMonthBirthdayCount = ""
          notification.lastMonthBirthday = []
        }


        // let chat_count = text_chat.filter((item)=> item.isSeen == 'false').length;
        // let todayBirthday_count = todayBirthday.filter((item)=> item.isSeen == 'false').length;
        // let tomorrowBirthday_count = tomorrowBirthday.filter((item)=> item.isSeen == 'false').length;
        // let todayTask_count = todayTask.filter((item)=> item.isSeen == false).length;


        // notification.count = (chat_count + todayBirthday_count + tomorrowBirthday_count + todayTask_count)
        // notification.tasks = todayTask
        // notification.chat = text_chat
        // notification.todayBirthday = todayBirthday
        // notification.tomorrowBirthday = tomorrowBirthday
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
