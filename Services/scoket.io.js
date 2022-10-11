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
    // this.init();
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
          _id: 1, task_setting: 1, thisWeek_birthday_setting: 1, thisMonth_birthday_setting: 1, lastMonth_birthday_setting: 1, nextSixtyDays_birthday_setting: 1, nextNintyDays_birthday_setting: 1, chat_setting: 1, event_notification_setting: 1, thirtydays_expire_notification_setting_renewal: 1, sixtydays_expire_notification_setting_renewal: 1, nintydays_expire_notification_setting_renewal: 1, expire_notification_setting: 1,
          fourteen_missucall_notification_setting: 1, thirty_missucall_notification_setting: 1, sixtyPlus_missucall_notification_setting: 1, sixty_missucall_notification_setting: 1
        })
        console.log("User--> ", users)
        console.log(users.task_setting)
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
        if (users["_doc"]["thirtydays_expire_notification_setting_renewal"]) {
          let now = new Date();
          let todaysDate = moment(now).format('YYYY-MM-DD')
          const afterThirty = new Date(now.setDate(now.getDate() + 30));
          const thirtyDaysExpire = moment(afterThirty).format('YYYY-MM-DD');
          console.log(thirtyDaysExpire, "-> ", todaysDate)
          let thirty_days_expire = await buymembership.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { $expr: { $and: [{ $lte: ["$expiry_date", thirtyDaysExpire] }, { $gte: ["$expiry_date", todaysDate] }] } }
                ]
              }
            },
            {
              $project: {
                studentInfo: 1,
                membership_name: 1,
                expiry_date: 1
              }
            },
            { $unwind: "$studentInfo" },
            {
              $addFields: {
                studentInfo: { $convert: { input: '$studentInfo', to: 'objectId', onError: '', onNull: '' } }
              }
            },
            {
              $lookup:
              {
                from: "members",
                localField: "studentInfo",
                foreignField: "_id",
                as: "memberInfo",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      isSeen: 1
                    },
                  },
                ],
              }
            },
            {
              $unwind: "$memberInfo"
            }
          ])
          console.log("thirty_days_expire-->", thirty_days_expire)
          let thirtyDaysExpireNotificationSettingRenewalCount = thirty_days_expire.filter((item) => item.isSeen == 'false').length;
          notification.thirtyDaysExpireNotificationSettingRenewalCount = thirtyDaysExpireNotificationSettingRenewalCount;
          notification.thirtyDaysExpireNotificationSettingRenewal = thirty_days_expire

        } else {
          notification.thirtyDaysExpireNotificationSettingRenewalCount = 0
          notification.thirtyDaysExpireNotificationSettingRenewal = []
        }

        if (users["_doc"]["sixtydays_expire_notification_setting_renewal"]) {
          let now = new Date();
          let todaysDate = moment(now).format('YYYY-MM-DD')
          const afterThirty = new Date(now.setDate(now.getDate() + 30));
          const afterSixty = new Date(now.setDate(now.getDate() + 60))
          const sixtyDaysExpire = moment(afterSixty).format('YYYY-MM-DD')
          const thirtyDaysExpire = moment(afterThirty).format('YYYY-MM-DD');
          console.log(sixtyDaysExpire, thirtyDaysExpire)
          let sixty_days_expire = await buymembership.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { $expr: { $and: [{ $lte: ["$expiry_date", sixtyDaysExpire] }, { $gte: ["$expiry_date", thirtyDaysExpire] }] } }
                ]
              }
            },
            {
              $project: {
                studentInfo: 1,
                membership_name: 1,
                expiry_date: 1
              }
            },
            { $unwind: "$studentInfo" },
            {
              $addFields: {
                studentInfo: { $convert: { input: '$studentInfo', to: 'objectId', onError: '', onNull: '' } }
              }
            },
            {
              $lookup:
              {
                from: "member",
                localField: "studentInfo",
                foreignField: "_id",
                as: "memberInfo",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      isSeen: 1
                    },
                  },
                ],
              }
            },
            {
              $unwind: "$memberInfo"
            }
          ])
          console.log("sixty_days_expire-->", sixty_days_expire)
          let sixtyDaysExpireNotificationSettingRenewalCount = sixty_days_expire.filter((item) => item.isSeen == 'false').length;
          notification.sixtyDaysExpireNotificationSettingRenewalCount = sixtyDaysExpireNotificationSettingRenewalCount;
          notification.sixtyDaysExpireNotificationSettingRenewal = sixty_days_expire;
        } else {
          notification.sixtyDaysExpireNotificationSettingRenewalCount = 0
          notification.sixtyDaysExpireNotificationSettingRenewal = []
        }

        if (users["_doc"]["nintydays_expire_notification_setting_renewal"]) {
          let now = new Date();
          let todaysDate = moment(now).format('YYYY-MM-DD')
          const afterNinty = new Date(now.setDate(now.getDate() + 90));
          const afterSixty = new Date(now.setDate(now.getDate() + 60))
          const sixtyDaysExpire = moment(afterSixty).format('YYYY-MM-DD')
          const nintyDaysExpire = moment(afterNinty).format('YYYY-MM-DD');
          let ninty_days_expire = await buymembership.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { $expr: { $and: [{ $lte: ["$expiry_date", nintyDaysExpire] }, { $gte: ["$expiry_date", sixtyDaysExpire] }] } }
                ]
              }
            },
            {
              $project: {
                studentInfo: 1,
                membership_name: 1,
                expiry_date: 1
              }
            },
            { $unwind: "$studentInfo" },
            {
              $addFields: {
                studentInfo: { $convert: { input: '$studentInfo', to: 'objectId', onError: '', onNull: '' } }
              }
            },
            {
              $lookup:
              {
                from: "member",
                localField: "studentInfo",
                foreignField: "_id",
                as: "memberInfo",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      isSeen: 1
                    },
                  },
                ],
              }
            },
            {
              $unwind: "$memberInfo"
            }
          ])
          console.log("ninty_days_expire-->", ninty_days_expire)
          let nintyDaysExpireNotificationSettingRenewalCount = ninty_days_expire.filter((item) => item.isSeen == 'false').length;
          notification.nintyDaysExpireNotificationSettingRenewalCount = nintyDaysExpireNotificationSettingRenewalCount;
          notification.nintyDaysExpireNotificationSettingRenewal = ninty_days_expire;
        } else {
          notification.nintyDaysExpireNotificationSettingRenewalCount = 0
          notification.nintyDaysExpireNotificationSettingRenewal = []
        }

        if (users["_doc"]["expire_notification_setting"]) {
          let expireMembership = await buymembership.aggregate([
            {
              $match: {
                $and: [
                  { userId: userId },
                  { membership_status: "Expired" }
                ]
              }
            },
            {
              $project: {
                studentInfo: 1,
                membership_name: 1,
                expiry_date: 1
              }
            },
            { $unwind: "$studentInfo" },
            {
              $addFields: {
                studentInfo: { $convert: { input: '$studentInfo', to: 'objectId', onError: '', onNull: '' } }
              }
            },
            {
              $lookup:
              {
                from: "member",
                localField: "studentInfo",
                foreignField: "_id",
                as: "memberInfo",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      firstName: 1,
                      lastName: 1,
                      isSeen: 1
                    },
                  },
                ],
              }
            },
            {
              $unwind: "$memberInfo"
            }
          ])
          console.log("expireMembership-->", expireMembership)
          let ExpireNotificationSettingRenewalCount = expireMembership.filter((item) => item.isSeen == 'false').length;
          notification.ExpireNotificationSettingRenewalCount = ExpireNotificationSettingRenewalCount;
          notification.ExpireNotificationSettingRenewal = expireMembership;
        } else {
          notification.ExpireNotificationSettingRenewalCount = 0
          notification.ExpireNotificationSettingRenewal = []
        }

        if (users["_doc"]["fourteen_missucall_notification_setting"]) {
          let sevenToFourteen = await member.aggregate([
            {
              $match: {
                userId: userId
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                last_attended_date: 1,
                missclass_count: 1,
                isSeen: 1
              }
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
              }
            },
            {
              $match: {
                dayssince: {
                  $gte: 7,
                  $lte: 14,
                }
              }
            }
          ])

          console.log("sevenToFourteen-->", sevenToFourteen)
          let sevenToFourteenMissucallCount = sevenToFourteen.filter((item) => item.isSeen == 'false').length;
          notification.sevenToFourteenMissucallCount = sevenToFourteenMissucallCount;
          notification.sevenToFourteenNotification = sevenToFourteen;
        } else {
          notification.sevenToFourteenMissucallCount = 0
          notification.sevenToFourteenNotification = []
        }

        if (users["_doc"]["thirty_missucall_notification_setting"]) {
          let fourteenToThirty = await member.aggregate([
            {
              $match: {
                userId: userId
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                last_attended_date: 1,
                missclass_count: 1,
                isSeen: 1
              }
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
              }
            },
            {
              $match: {
                dayssince: {
                  $gte: 15,
                  $lte: 30,
                }
              }
            }
          ])

          console.log("fourteenToThirty-->", fourteenToThirty)
          let fourteenToThirtyMissucallCount = fourteenToThirty.filter((item) => item.isSeen == 'false').length;
          notification.fourteenToThirtyMissucallCount = fourteenToThirtyMissucallCount;
          notification.fourteenToThirtyNotification = fourteenToThirty;
        } else {
          notification.fourteenToThirtyMissucallCount = 0
          notification.fourteenToThirtyNotification = []
        }

        if (users["_doc"]["thirty_missucall_notification_setting"]) {
          let thirtyToSixty = await member.aggregate([
            {
              $match: {
                userId: userId
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                last_attended_date: 1,
                missclass_count: 1,
                isSeen: 1
              }
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
              }
            },
            {
              $match: {
                dayssince: {
                  $gte: 30,
                  $lte: 60,
                }
              }
            }
          ])

          console.log("thirtyToSixty-->", thirtyToSixty)
          let thirtyToSixtyMissucallCount = thirtyToSixty.filter((item) => item.isSeen == 'false').length;
          notification.thirtyToSixtyMissucallCount = thirtyToSixtyMissucallCount;
          notification.thirtyToSixtyNotification = thirtyToSixty;
        } else {
          notification.thirtyToSixtyMissucallCount = 0
          notification.thirtyToSixtyNotification = []
        }


        if (users["_doc"]["sixtyPlus_missucall_notification_setting"]) {
          let sixtyPlus = await member.aggregate([
            {
              $match: {
                userId: userId
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                last_attended_date: 1,
                missclass_count: 1,
                isSeen: 1
              }
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
              }
            },
            {
              $match: {
                dayssince: {
                  $gte: 60,
                }
              }
            }
          ])

          console.log("sixtyPlus-->", sixtyPlus)
          let sixtyPlusMissucallCount = sixtyPlus.filter((item) => item.isSeen == 'false').length;
          notification.sixtyPlusMissucallCount = sixtyPlusMissucallCount;
          notification.sixtyPlusNotification = sixtyPlus;
        } else {
          notification.sixtyPlusMissucallCount = 0
          notification.sixtyPlusNotification = []
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
