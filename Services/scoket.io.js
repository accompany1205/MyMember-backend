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

      socket.on('alertGetTexts', async (getText) => {
        try {
          const { userId, uid } = getText;
          const textList = await textMessage.find(getText);
          io.to(`${userId}${uid}`).emit('getText', textList);
        } catch (err) {
          console.log(err);
        }
      });
    
      socket.on('push-notification', async (userId) =>{
        let notification = {}
        let currDate = new Date().toISOString().slice(0, 10);
        let todayTask = await tasks.find(
          {
            userId: userId,
            start: currDate,
            $or:[{'isSeen':null}, {'isSeen':false}]
          },
          {name: 1,start: 1}
        );

       let text_chat = await textMessage.aggregate([
          {"$match": {"$and":[{ userId:userId },{'isSeen':null} ]}},
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
         notification.count = (todayTask.length + text_chat.length)
         notification.tasks = todayTask  
         notification.chat = text_chat
         io.to(userId).emit('getNotification',notification) 
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
