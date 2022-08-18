const appoint = require("../models/appointment");
const recommended = require("../models/recommendedForTest")
const registeredForTest = require('../models/registerdForTest')
const invitee = require('../models/eventInvitee')
const registered = require("../models/eventRegistered")
const _ = require("lodash");
const program_rank = require('../models/program_rank')
const program = require('../models/program')
const Invitee = require("../models/eventInvitee")
const EventRegistered = require("../models/eventRegistered");
const Member = require('../models/addmember');
const cloudUrl = require('../gcloud/imageUrl');
const Mailer = require("../helpers/Mailer");
require("dotenv").config();

exports.Create = async (req, res) => {
  var appoinemnt = req.body;
  let userId = req.params.userId
  let dateRanges = req.body.repeatedDates;
  try {
    let allAppt = [];
    if (dateRanges.length > 1) {
      for (let dates in dateRanges) {
        let newAppt = { ...req.body, start: dateRanges[dates], end: dateRanges[dates], userId: userId, repeatedDates: dateRanges };
        allAppt.push(newAppt);
      }
      let resp = await appoint.insertMany(allAppt);
      res.send({ msg: "Appointment added!", success: true, resp })
    } else {
      var App = _.extend(appoinemnt, req.params);
      const campaigns = new appoint(App);
      campaigns.save((err, appdata) => {
        if (err) {
          res.send({ msg: "appoinment is not added", success: false });
        } else {
          res.send({ success: true, msg: "apoointment added!", appdata });
        }
      });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
};


exports.sendEmailToGuest = async (req, res) => {
  let emailList = req.body.emailList;
  if (emailList.length === 0) {
    return res.send({ msg: "Please select students!", success: false });
  }
  let subject = req.body.subject;
  let url = req.body.url;
  try {
    const emailData = new Mailer({
      to: emailList,
      from: "akshit20@navgurukul.org",
      subject: subject,
      html: url
    })

    emailData.sendMail().then(resp => {
      return res.send({ msg: "email Sent!", success: true })
    }).catch(err => {
      return res.send({ msg: err.message.replace(/\"/g, ""), success: false });
    })
  } catch (err) {
    return res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}




exports.apptCreate = async (req, res) => {
  let Appts = req.body
  let userId = req.params.userId;
  let dateRanges = JSON.parse(req.body.repeatedDates);
  try {
    let allAppt = [];
    let bannerImage = null;
    if (req.file) {
      bannerImage = await cloudUrl.imageUrl(req.file);
    }
    if (dateRanges.length > 1) {
      for (let dates in dateRanges) {
        let newAppt = { ...req.body, eventBanner: bannerImage, start: dateRanges[dates], end: dateRanges[dates], userId: userId, repeatedDates: dateRanges };
        allAppt.push(newAppt);
      }
      let resp = await appoint.insertMany(allAppt);
      return res.send({ msg: "Appointment added!", success: true, resp })
    } else {
      var App = _.extend(Appts, req.params);
      const campaigns = new appoint(App);
      campaigns.save((err, appdata) => {
        if (err) {
          return res.send({ msg: "appoinment is not added", success: false });
        } else {
          return res.send({ success: true, msg: "apoointment added!", appdata });
        }
      });
    }
  } catch (err) {
    return res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.updateAll = async (req, res) => {
  let userId = req.params.userId;
  let oldCategoryId = req.params.oldcategoryname;
  let dateRanges = req.body.repeatedDates;
  try {
    let allAppt = [];
    for (let dates in dateRanges) {
      let newAppt = { ...req.body, start: dateRanges[dates], end: dateRanges[dates], userId: userId, repeatedDates: dateRanges };
      allAppt.push(newAppt);
    }
    await appoint.deleteMany({
      $and: [{ userId: userId },
      { category: oldCategoryId }]
    }).then(async (updatedRes) => {
      if (updatedRes.nModified < 1) {
        res.status(403).json({
          msg: 'appointment not updated!',
          success: false
        })
      }
      else {
        const res1 = await appoint.insertMany(allAppt);
        res.status(200).json({
          msg: 'All class schedule has been updated Successfully',
          success: true
        })
      }
    })
    // let resp = await appoint.insertMany(allAppt);
    // res.send({ msg: "Appointment added!", success: true, resp })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.getInvitees = async (req, res) => {
  let userId = req.params.userId;
  let eventId = req.params.eventId;

  let invitees = await Invitee.find({
    "userId": userId, "eventId": eventId, "isDeleted": false
  });
  let attendee = await EventRegistered.find({
    "userId": userId, "eventId": eventId, "isDeleted": true
  });
  let registeredInvitee = await EventRegistered.find({ "userId": userId, "eventId": eventId, "isDeleted": false });
  if (!invitees.length) {
    return res.json({
      data: [],
      success: false,
      msg: "There is no data found!"
    })
  }
  return res.json({
    success: true,
    data: invitees,
    count: { invitees: invitees.length, attendee: attendee.length, registeredInvitee: registeredInvitee.length }
  })
}

exports.getAttended = async (req, res) => {
  let userId = req.params.userId;
  let eventId = req.params.eventId;
  let attendee = await EventRegistered.find({
    "userId": userId, "eventId": eventId, "isDeleted": true
  });
  if (!attendee.length) {
    return res.json({
      data: [],
      success: false,
      msg: "There is no data found!"
    })
  }
  return res.json({
    success: true,
    data: attendee
  })
}

exports.getRegisteredInvitees = async (req, res) => {
  let userId = req.params.userId;
  let eventId = req.params.eventId;

  let registeredInvitee = await EventRegistered.find({ "userId": userId, "eventId": eventId, "isDeleted": false });
  if (!registeredInvitee.length) {
    return res.json({
      data: [],
      success: false,
      msg: "There is no data found!"
    })
  }
  return res.json({
    success: true,
    data: registeredInvitee
  })
}

exports.eventPay = async (req, res) => {
  let eventRegistered = req.params.eventRegisteredId;
  try {
    let registerd = {
      "testId": req.body.testId,
      "method": req.body.method,
      "cheque_no": req.body.cheque_no,
      "isPaid": req.body.isPaid
    };
    EventRegistered.findOneAndUpdate({ _id: eventRegistered }, { $set: registerd })
      .then((data) => {
        return res.send({ msg: "payment done!", success: true });
      }).catch(err => {
        return res.send({ msg: err.message.replace(/\"/g, ""), success: false, })
      })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.generalBeltCount = async (req, res) => {
  let eventId = req.params.eventId;
  let userId = req.params.userId;
  try {
    const inviteeData = async () => {
      try {
        let studentsBelts = await invitee.find({
          eventId: eventId, isDeleted: false
        },
          { _id: 0, current_rank_name: 1, program: 1 }
        )
        const beltInfo = await loopingForBelts(userId, studentsBelts);
        return beltInfo;
      } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      }
    }
    const registerData = async (is_delete) => {
      try {
        let studentsBelts = await registered.find({
          eventId: eventId, isDeleted: is_delete
        },
          { _id: 0, current_rank_name: 1, program: 1 }
        )
        const beltInfo = await loopingForBelts(userId, studentsBelts);
        return beltInfo
      } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      }
    }
    const invitee_data = await inviteeData();
    const register_data = await registerData(false);
    const attended_data = await registerData(true);
    return res.send({ invitee: invitee_data, register: register_data, attended: attended_data })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

async function loopingForBelts(userId, studentsBelts) {
  let programBelts = await program.aggregate([
    {
      $match: {
        $or: [
          { userId: userId }, { adminId: process.env.ADMINID }
        ]
      }
    },
    { $project: { "program_rank": 1, "_id": 0 } },
    { $unwind: "$program_rank" },
  ])
  await program_rank.populate(programBelts, {
    path: "program_rank",
    model: "Program_rank",
    select: "rank_name programName rank_image -_id"
  });
  let belts = programBelts.map(i => i.program_rank);
  let beltInfo = []
  for (i of belts) {
    let count = 0
    for (j of studentsBelts) {
      if (i.programName === j.program && i.rank_name === j.current_rank_name) {
        count++
      }
    }
    beltInfo.push({ programName: i.programName, belt: i.rank_name, rank_image: i.rank_image, count: count, })
  }
  return beltInfo;
}

exports.promotionBeltCount = async (req, res) => {
  let eventId = req.params.eventId;
  let userId = req.params.userId;
  let event = req.query.event;
  try {
    if (event === "Recommended") {
      try {
        let studentsBelts = await recommended.find({
          eventId: eventId, isDeleted: false
        },
          { _id: 0, current_rank_name: 1, program: 1 }
        )

        let programBelts = await program.aggregate([
          {
            $match: {
              $or: [
                { userId: userId }, { adminId: process.env.ADMINID }
              ]
            }
          },
          { $project: { "program_rank": 1, "_id": 0 } },
          { $unwind: "$program_rank" },
        ])
        let data = await program_rank.populate(programBelts, {
          path: "program_rank",
          model: "Program_rank",
          select: "rank_name programName rank_image -_id"
        });
        let belts = []
        for (let i of programBelts) {
          belts.push(i.program_rank)
        }
        let beltInfo = []
        for (i of belts) {
          let count = 0

          for (j of studentsBelts) {
            if (i.programName === j.program && i.rank_name === j.current_rank_name) {
              count++
            }
          }
          beltInfo.push({ programName: i.programName, belt: i.rank_name, rank_image: i.rank_image, count: count, })
        }
        return res.send(beltInfo)

      } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      }

    } else if (event === "Register") {
      try {
        let studentsBelts = await registeredForTest.find({
          eventId: eventId, isDeleted: false
        },
          { _id: 0, current_rank_name: 1, program: 1 }
        )

        let programBelts = await program.aggregate([
          {
            $match: {
              $or: [
                { userId: userId }, { adminId: process.env.ADMINID }
              ]
            }
          },
          { $project: { "program_rank": 1, "_id": 0 } },
          { $unwind: "$program_rank" },
        ])
        let data = await program_rank.populate(programBelts, {
          path: "program_rank",
          model: "Program_rank",
          select: "rank_name programName -_id rank_image"
        });
        let belts = []
        for (let i of programBelts) {
          belts.push(i.program_rank)
        }
        let beltInfo = []
        for (i of belts) {
          let count = 0

          for (j of studentsBelts) {
            if (i.programName === j.program && i.rank_name === j.current_rank_name) {
              count++
            }
          }
          beltInfo.push({ programName: i.programName, belt: i.rank_name, rank_image: i.rank_image, count: count, })
        }
        return res.send(beltInfo)

      } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      }

    } else if (event == "Promoted") {
      try {
        let studentsBelts = await registeredForTest.find({
          eventId: eventId, isDeleted: true
        },
          { _id: 0, current_rank_name: 1, program: 1 }
        )

        let programBelts = await program.aggregate([
          {
            $match: {
              $or: [
                { userId: userId }, { adminId: process.env.ADMINID }
              ]
            }
          },
          { $project: { "program_rank": 1, "_id": 0 } },
          { $unwind: "$program_rank" },
        ])
        let data = await program_rank.populate(programBelts, {
          path: "program_rank",
          model: "Program_rank",
          select: "rank_name programName -_id rank_image"
        });
        let belts = []
        for (let i of programBelts) {
          belts.push(i.program_rank)
        }
        let beltInfo = []
        for (i of belts) {
          let count = 0

          for (j of studentsBelts) {
            if (i.programName === j.program && i.rank_name === j.current_rank_name) {
              count++
            }
          }
          beltInfo.push({ programName: i.programName, belt: i.rank_name, rank_image: i.rank_image, count: count, })
        }
        return res.send(beltInfo)

      } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ""), success: false })
      }


    }
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }

}

exports.addToAttended = async (req, res) => {
  let studentIds = req.body.studentIds;
  let eventId = req.params.eventId;
  try {
    if (!studentIds.length) {
      return res.json({
        success: false,
        msg: "You haven't selected any student!"
      })
    }
    const promises = [];
    for (let student of studentIds) {
      promises.push(updateRegisterdInviteeByIdForAttended(student, eventId));
    }
    await Promise.all(promises);
    res.json({
      success: true,
      msg: "Selected students moved to attended!"
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

const updateRegisterdInviteeByIdForAttended = async (studentId, eventId) => {
  return await EventRegistered.updateOne({ studentId: studentId, eventId: eventId }, { "isDeleted": true });
}

exports.payForRegister = async (req, res) => {
  let userId = req.params.userId;
  try {
    let eventRegisterData = req.body;
    eventRegisterData.userId = userId;
    let eventRegister = new EventRegistered(eventRegisterData);
    eventRegister.save(async (err, data) => {
      if (err) {
        return res.send({
          success: false,
          msg: "Having some issue while register, put all fields"
        })
      }
      updateInviteeByIdForRegistered(req.body.studentId, req.body.eventId);
    });
    res.send({
      success: true,
      msg: "Student has been promoted to the register list!"
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.registerInvitee = async (req, res) => {
  let students = req.body;
  let userId = req.params.userId;
  let eventId = req.params.eventId;
  try {
    if (!students.length) {
      return res.json({
        success: false,
        msg: "You haven't selected any student!"
      })
    }
    let registerInvitee = [];
    const promises = [];
    for (let student of students) {
      let appt = await EventRegistered.find({
        $or: [
          { "eventId": eventId, "isDeleted": false, "studentId": student.studentId },
          { "eventId": eventId, "isDeleted": true, "studentId": student.studentId }
        ]
      });
      if (appt.length === 0 && student.program) {
        student.userId = userId;
        student.eventId = eventId;
        registerInvitee.push(student)
        promises.push(updateInviteeByIdForRegistered(student.studentId, eventId))
      }
    }
    await Promise.all(promises);
    await EventRegistered.insertMany(registerInvitee);
    res.send({
      success: true,
      msg: "Selected students got registered successfully!"
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

const updateInviteeByIdForRegistered = async (studentId, eventId) => {
  return await Invitee.updateOne({ studentId: studentId, eventId: eventId, isDeleted: false }, { "isDeleted": true })
}

exports.addInvitee = async (req, res) => {
  let students = req.body;
  let eventId = req.params.eventId;
  let userId = req.params.userId;
  try {
    if (!students.length) {
      res.json({
        success: false,
        msg: "You haven't selected any student!"
      })
    }
    let InviteeforEvent = [];
    const promises = [];
    var alredyInvitee = "";
    for (let student of students) {
      let appt = await Invitee.find({
        $or: [
          { "eventId": eventId, "isDeleted": false, "studentId": student.studentId },
          { "eventId": eventId, "isDeleted": true, "studentId": student.studentId }
        ]
      });
      if (appt.length === 0) {
        student.userId = userId;
        student.eventId = eventId;
        InviteeforEvent.push(student);
        //promises.push(updateStudentsById(student.studentId))
      } else {
        alredyInvitee += `${student.firstName} , `
      }
    }
    await Promise.all(promises);
    await Invitee.insertMany(InviteeforEvent);
    if (alredyInvitee) {
      return res.send({
        msg: `${alredyInvitee} These students are already on the event!`,
        InviteeforEvent,
        success: false
      })
    }
    res.send({
      success: true,
      msg: "Selected students added successfully!"
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

const updateStudentsById = async (studentId) => {
  return Member.findByIdAndUpdate({ _id: studentId }, { isInvitee: true })
}

exports.deleteInvitee = async (req, res) => {
  let inviteeIds = req.body.inviteeIds;
  try {
    for (let invitee of inviteeIds) {
      // console.log(invitee)
      await Invitee.deleteOne(({ _id: invitee }));
    }
    res.send({
      msg: "delete successfully!",
      success: true,
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.deleteRegister = async (req, res) => {
  let RegisteredIds = req.body.RegisteredIds;
  try {
    for (let registered of RegisteredIds) {
      await EventRegistered.deleteOne(({ _id: registered }));
    }
    res.send({
      msg: "delete successfully!",
      success: true,
    })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.filterEvents = async (req, res) => {
  let userId = req.params.userId;
  let apptType = req.body.appttype;
  let startDate = req.body.startDate;
  let Year = startDate.split('-')[2]
  let endDate = req.body.endDate;
  try {
    if (startDate) {
      const data = await appoint.aggregate([
        {
          $project: {
            title: 1,
            start: 1,
            appointment_type: 1,
            end: 1,
            userId: 1,
            year: { $substr: ["$start", 6, 10] },

          }
        },
        {
          $match: {
            $and: [
              { userId: userId },
              { year: Year },
              { appointment_type: apptType },
              { start: { $gte: (startDate), $lt: (endDate) } }

            ]
          }
        },

      ]);
      res.send({
        msg: "data!",
        data: data,
        success: true
      });
    } else {
      const data = await appoint.aggregate([
        {
          $match: {
            $and: [
              { userId: userId },
              { appointment_type: apptType }
            ]
          }
        },
        {
          $project: {
            title: 1,
            start: 1,
            appointment_type: 1,
            end: 1
          }
        }
      ]);
      res.send({
        msg: "data!",
        data: data,
        success: true
      });
    }

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.read = async (req, res) => {
  try {
    let startDate = req.params.dates;
    let newMonth = startDate.slice(0, 2)
    let nNewMonth = ("0" + (parseInt(newMonth))).slice(-2)
    // let newDate = startDate.slice(3, 5)
    let newDate = "01"
    let newYear = startDate.slice(-4);
    let updateM = ("0" + (parseInt(newMonth) + 1)).slice(-2);
    let nStartDate = `${newYear}-${nNewMonth}-${newDate}`
    console.log(nStartDate);
    let finalDate;
    if (newMonth === "12") {
      let newupdateM = "01";
      let updateY = ("" + (parseInt(newYear) + 1))
      finalDate = `${updateY}-${newupdateM}-${newDate}`;
    } else {
      finalDate = `${newYear}-${updateM}-${newDate}`;
    }
    appoint.find({
      $and: [{ userId: req.params.userId },
      { start: { $gte: (nStartDate), $lt: (finalDate) } }
      ]
    }).then((result) => {
      res.send({ success: true, data: result });
    })
      .catch((err) => {
        res.send({ msg: "No data!", err: err, success: false });
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }

  // for(let i of events){
  //   const obj={name:'kash'}
  //   _.defaults(i,obj)
  //   console.log(i)
  // }
  // Promise.all(events.map(async (object) => {
  // const a=await Object.assign(object, { color: "red" })
  // console.log(a)
  // const a={a:1}
  // console.log(obj)
  // console.log(a);

  // }))

  // })).then(resp1 => {
  //   console.log("--->", resp1)
  // }).catch(err => {
  //   console.log("-->", err)
  // });
  // console.log(data);
  // console.log(event1);
  // .then(async (result) => {
  // res.send({ success: true, data: result });
  // let events = result
  // console.log("events----> ", events);
  // const events =result.forEach(object => {
  //   object.color = "red";
  // })
  // console.log(events)
  // let promises = [];
  // let arr = events.map(async i => {
  //   let obj = {};
  //   let eventInfo
  //   if (i.appointment_type === "Promotion Test") {
  //     let recommendedTest = await recommended.find({ eventId: i._id, isDeleted: false })
  //     let registeredTest = await registeredForTest.find({ eventId: i._id, isDeleted: false })
  //     let promotedTest = await registeredForTest.find({ eventId: i._id, isDeleted: true })

  // obj.recommendedCount = recommendedTest.length
  // obj.registeredCount = registeredTest.length
  // obj.promotedCount = promotedTest.length
  // eventInfo = i;

  // } else if (i.appointment_type === "General Event") {
  // let eventInvitee = await invitee.find({ eventId: i._id, isDeleted: false })
  // console.log(inviteeTest)
  // let eventRegister = await registered.find({ eventId: i._id, isDeleted: false })
  // console.log(registerTest)
  // let eventAttended = await registered.find({ eventId: i._id, isDeleted: true })
  // console.log(attendedTest)          
  //     obj.eventInvitee = eventInvitee.length
  //     obj.eventRegister = eventRegister.length
  //     obj.eventAttended = eventAttended.length
  //     eventInfo = i;
  //   }
  //   return {...obj,eventInfo};
  // })
  // let data = await Promise.all(arr)
  //console.log(await Promise.all(promises, arr))
  // console.log(data)
  // res.send(data);

  // })
  // .catch((err) => {
  //   res.send({ msg: "No data!", err: err.message.replace(/\"/g, ""), success: false });
  // });
  // let startDate = (req.params.dates);
  // console.log("wrwjreirj-->")
  // let userId = req.params.userId;
  // let newMonth = parseInt(startDate.slice(0,2));
  // let newYear = parseInt(startDate.slice(-4));
  // try {
  //   let datas = await appoint.aggregate([
  //     {
  //       $match: { userId: userId }
  //     },
  //     {
  //       $project: {
  //             title: "$title",
  //             category: "$category",
  //             appointment_type: "$appointment_type",
  //             app_color: "$app_color",
  //             start:"$start",
  //             end:"$end",
  //             month: { $month: "$start" },
  //             year: {$year: "$start" },
  //             start_time:"$start_time",
  //             end_time:"$end_time",
  //             notes:"$notes",
  //             status:"$status",
  //             ticketType:"$ticketType",
  //             eventBanner:"$eventBanner",
  //             tickeNotes:"$tickeNotes",
  //             hostName:"$hostName",
  //             hostEmail: "$hostEmail",
  //             hostMobileNumber: "$hostMobileNumber",
  //             hostAlternateNumber: "$hostAlternateNumber",
  //             eventLocation: "$eventLocation",
  //             eventStreet: "$eventStreet",
  //             eventCity:"$eventCity",
  //             eventState:"$eventState",
  //             zip: "$zip",
  //             ticketName: "$ticketName",
  //             ticketAvailabeQuantity: "$ticketAvailabeQuantity",
  //             ticktePrice: "$ticktePrice",
  //             totalIncome: "$totalIncome"
  //           }
  //     },
  //     // {
  //     //   $project: {
  //     //     title: "$title",
  //     //     category: "$category",
  //     //     appointment_type: "$appointment_type",
  //     //     app_color: "$app_color",
  //     //     start:"$start",
  //     //     end:"$end",
  //     //     month: { $month: "$start" },
  //     //     year: {$year: "$start" },
  //     //     start_time:"$start_time",
  //     //     end_time:"$end_time",
  //     //     notes:"$notes",
  //     //     status:"$status",
  //     //     ticketType:"$ticketType",
  //     //     eventBanner:"$eventBanner",
  //     //     tickeNotes:"$tickeNotes",
  //     //     hostName:"$hostName",
  //     //     hostEmail: "$hostEmail",
  //     //     hostMobileNumber: "$hostMobileNumber",
  //     //     hostAlternateNumber: "$hostAlternateNumber",
  //     //     eventLocation: "$eventLocation",
  //     //     eventStreet: "$eventStreet",
  //     //     eventCity:"$eventCity",
  //     //     eventState:"$eventState",
  //     //     zip: "$zip",
  //     //     ticketName: "$ticketName",
  //     //     ticketAvailabeQuantity: "$ticketAvailabeQuantity",
  //     //     ticktePrice: "$ticktePrice",
  //     //     totalIncome: "$totalIncome"
  //     //   }
  //     // },
  //     {
  //       $match: {
  //         month:newMonth, year:newYear
  //       }
  //     }
  //   ]);
  //   console.log(datas)
  // } catch (err) {
  //   res.send({ msg: "No data!",err: err, success: false });
  // }
};

exports.allEvents = async (req, res) => {
  let userId = req.params.userId;
  try {
    let data = await appoint.find({ userId: userId });
    if (!data) {
      return res.send({ msg: "no data", success: false });
    }
    res.send({ msg: "data!", data: data, success: true });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.catRead = async (req, res) => {
  let userId = req.params.userId
  let catType = req.params.catType;
  try {
    if (catType === "event") {
      let totalCount = await appoint
        .find({
          $and: [{ userId: userId },
          { category: catType }]
        })
        .countDocuments();
      let per_page = parseInt(req.params.per_page) || 10;
      let page_no = parseInt(req.params.page_no) || 0;
      let pagination = {
        limit: per_page,
        skip: per_page * page_no,
      };
      await appoint
        .find({
          $and: [{ userId: userId },
          { category: catType }]
        })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .then((result) => {
          res.send({ success: true, totalCount: totalCount, data: result });
        })
        .catch((err) => {
          res.send({ msg: "No data!", success: false });
        });
    } else {
      let totalCount = await appoint
        .find({
          $and: [{ userId: userId },
          { category: catType }]
        })
        .countDocuments();
      let per_page = parseInt(req.params.per_page) || 10;
      let page_no = parseInt(req.params.page_no) || 0;
      let pagination = {
        limit: per_page,
        skip: per_page * page_no,
      };
      await appoint
        .find({
          $and: [{ userId: userId },
          { category: catType }]
        })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .then((result) => {
          res.send({ success: true, totalCount: totalCount, data: result });
        })
        .catch((err) => {
          res.send({ msg: "No data!", success: false });
        });
    }
  } catch (err) {
    console.error(err);
  }
}

exports.appointInfo = (req, res) => {
  const id = req.params.appointId;
  appoint
    .findById(id)
    .then((result) => {
      res.send({ msg: "Data!", success: true, result });
    })
    .catch((err) => {
      res.send({ msg: "No data!", success: false });
    });
};


exports.update = async (req, res) => {
  const id = req.params.appointId;
  let bannerImage = null;
  try {
    if (req.file) {
      bannerImage = await cloudUrl.imageUrl(req.file);
      let data = { ...req.body, eventBanner: bannerImage }
      appoint
        .findByIdAndUpdate(id, { $set: data })
        .then((update_resp) => {
          res.send({ msg: "Appointment Updated successfuly", success: true, update_resp });
        })
        .catch((err) => {
          res.send({ msg: "Appointment Not updated!", success: false });
        });
    } else {
      appoint
        .findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
          res.send({ msg: "Appointment Updated successfuly", success: true, update_resp });
        })
        .catch((err) => {
          res.send({ msg: "Appointment Not updated!", success: false });
        });
    }

  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })
  }
};

exports.appointmentFilter = async (req, res) => {

  let catType = req.params.catType;
  var per_page = parseInt(req.params.per_page) || 5;
  var page_no = parseInt(req.params.page_no) || 0;
  var pagination = {
    limit: per_page,
    skip: per_page * page_no,
  };
  const filter = req.query.filter;
  const userId = req.params.userId;
  let date = new Date();

  try {
    if (filter === "Today") {
      let cDate = ("0" + (date.getDate())).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cMonth}-${cDate}-${cYear}`;
      const totalCount = await appoint.find({
        $and: [
          { category: catType },
          { userId: userId },
          { start: currentDate }
        ]
      }).countDocuments();

      appoint.find({
        $and: [
          { category: catType },
          { userId: userId },
          { start: currentDate }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, data: result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (filter === "Tomorrow") {
      let cDate = ("0" + (date.getDate() + 1)).slice(-2);
      let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
      let cYear = date.getFullYear();
      let currentDate = `${cMonth}-${cDate}-${cYear}`;
      const totalCount = await appoint.find({
        $and: [
          { category: catType },
          { userId: userId },
          { start: currentDate }
        ]
      }).countDocuments();

      appoint.find({
        $and: [
          { category: catType },
          { userId: userId },
          { start: currentDate }
        ]
      }).limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
          res.send({ success: true, data: result, totalCount: totalCount })
        }).catch((err) => {
          res.send(err)
        })
    } else if (filter === "This Week") {
      appoint
        .aggregate([
          {
            $match: {
              category: catType,
              userId: userId
            }
          },
          {
            $project: {
              status: 1,
              repeatedDates: 1,
              groupInfoList: 1,
              studentInfo: 1,
              end_time: 1,
              start_time: 1,
              start: 1,
              app_color: 1,
              end: 1,
              repeatedConcurrence: 1,
              interval: 1,
              range: 1,
              appointment_type: 1,
              title: 1,
              category: 1,
              notes: 1,
              date: {
                "$dateFromString": {
                  "dateString": "$start",
                  "format": "%m-%d-%Y"
                }
              }
            },
          },
          {
            $match: {
              $expr:
                { $eq: [{ $week: '$date' }, { $week: "$$NOW" }] }
            }
          },
          {
            $facet: {
              paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
              totalCount: [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
            });
          } else {
            let data = memberdata[0].paginatedResults
            if (data.length > 0) {
              res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

            } else {
              res.send({ msg: 'data not found', success: false });
            }
          }
        })
    } else if (filter === "This Month") {
      appoint.
        aggregate([
          {
            $match: {
              category: catType,
              userId: userId
            }
          },
          {
            $project: {
              status: 1,
              repeatedDates: 1,
              groupInfoList: 1,
              studentInfo: 1,
              end_time: 1,
              start_time: 1,
              app_color: 1,
              end: 1,
              repeatedConcurrence: 1,
              interval: 1,
              range: 1,
              appointment_type: 1,
              title: 1,
              category: 1,
              notes: 1,
              start: 1,
              date: {
                "$dateFromString": {
                  "dateString": "$start",
                  "format": "%m-%d-%Y"
                }
              }

            },
          },
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $month: "$date",
                  },
                  {
                    $month: "$$NOW",
                  },
                ]
              }
            },
          },
          {
            $facet: {
              paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
              totalCount: [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ])
        .exec((err, memberdata) => {
          if (err) {
            res.send({
              error: err,
            });
          } else {
            let data = memberdata[0].paginatedResults
            if (data.length > 0) {
              res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

            } else {
              res.send({ msg: 'data not found', success: false });
            }
          }
        })
    }
  }
  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
};
exports.deleteAll = (req, res) => {
  try {
    appoint.deleteMany({
      $and: [{ userId: req.params.userId },
      { category: req.params.oldcategoryname }]
    }).then(resp => {
      if (resp.deleteCount < 1) {
        res.send({
          msg: "No category found!", success: false
        })
      } else {
        res.status(200).json({
          msg: 'All Appointment has been deleted Successfully',
          success: true

        })
      }
    }).catch(err => {
      res.send({ error: err.message.replace(/\"/g, ""), success: false })
    })
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })
  }
}

exports.remove = (req, res) => {
  const id = req.params.appointId;
  appoint
    .deleteOne({ _id: id })
    .then((resp) => {
      res.send({ msg: "appointment deleted successfuly", success: true });
    })
    .catch((err) => {
      res.send({ msg: "appointment not deleted!", success: false });
    });
};
