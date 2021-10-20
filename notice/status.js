const corn = require('node-cron')
const addmemberModal = require('../models/addmember')
const emailsentsave = require('../models/emailSentSave')
const textSentSave = require("../models/textSentSave")
const sgMail = require('sendgrid-v3-node');
const { sync } = require('make-dir');
// 00 13 19 * * 0-6

//update student expire status
module.exports = corn.schedule("00 02 17 * * 0-6", function(){
    addmemberModal.find({})
        .populate('membership_details')
        .exec((err, stdData) => {
            if (err) {
                res.send({ error: 'student data not found' })
            }
            else {
                for (row of stdData) {
                    for (member of row.membership_details) {
                        var expiry_date = member.expiry_date;
                        var expdate = new Date(expiry_date)
                        if (expdate < new Date()) {
                            const subtract = (new Date() - new Date(expiry_date))
                            const diffTime = Math.abs(subtract);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            addmemberModal.findByIdAndUpdate({ _id: row._id }, { status:'expired', days_expire: diffDays })
                                .exec((err, updateStatus) => {
                                    if (err) {
                                        res.send(err)
                                    }
                                    else {
                                        res.send('status update successfully')
                                    }
                                })
                        }
                        else {
                            res.send('membership is not expire')
                        }
                    }
                }
            }
        })
})

// after one day all attendence_status is false
module.exports = corn.schedule("00 24 17 * * 0-6", function () {
    addmemberModal.find({ attendence_status: true }).exec((err, Status) => {
        if (err) {
            send.send({ error: 'status is not find' })
        }
        else {
            for (row of Status) {
                addmemberModal.update({ _id: row._id }, { $set: { attendence_status: false } })
                    .exec((err, updateStatus) => {
                        if (err) {
                            res.send(err)
                        }
                        else {
                            res.send({ msg: 'attendance status is update' })
                        }
                    })
            }
        }
    })
})


//student rating update
module.exports = corn.schedule("00 12 19 * * 0-6", function () {
    addmemberModal.find({ attendence_status: false }).exec((err, notattend) => {
        if (err) {
            res.send({ error: 'student false status is not found' })
        }
        else {
            for (row of notattend) {
                addmemberModal.update({ _id: row._id }, { $set: { rating: row.rating + 1 } })
                    .exec((err, updaterating) => {
                        if (err) {
                            res.send({ error: 'student attendence status is not update' })
                        }
                        else {
                            res.send({ msg: 'student attendence status is update' })
                        }
                    })
            }
        }
    })
})

//left day count of birthday
module.exports = corn.schedule("00 55 11 * * 0-6", function () {
    addmemberModal.find({}).exec((err, list_member) => {
        if (err) {
            res.send({ error: 'member list not found' })
        }
        else {
            for (row of list_member) {
                var birthDate = row.dob
                var currentDate = new Date()
                var currentYear = new Date().getFullYear();
                var today = new Date(currentYear, currentDate.getMonth(), currentDate.getDate());
                var yearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

                var timDiffInMilliSeconds = yearBirthday.getTime() - today.getTime();
                var timDiffInDays = timDiffInMilliSeconds / (1000 * 60 * 60 * 24);
                var leftDay = timDiffInDays - 1

                addmemberModal.findByIdAndUpdate({ _id: row._id }, { $set: { day_left: leftDay } })
                    .exec((err, left_day) => {
                        if (err) {
                            res.send({ error: 'birthday left day is not update' })
                        }
                        else {
                            res.send({ msg: 'birthday left day is update' })
                        }
                    })

            }
        }
    })
})



module.exports = corn.schedule('*/20 * * * * *',function(){
    let options = {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        },
      
        formatter = new Intl.DateTimeFormat([], options);
        var a =(formatter.format(new Date()));

        var str = a
        var h = str.split(",");
        var dates = h[0]
        var d = dates.split('/')
        var dateary = d
        // var hms = h[1].split(':')    
        // 4/21/2021, 11:08:00 AM dt
// 0|app       | 4/21/2021  11:08:00 AM split_td
// 0|app       | [ ' 11', '08', '00 AM' ] splitT
// 0|app       | 2021 20 4  11 08 0 0
// 0|app       | 2022-09-04T11:08:00.000Z cur
// 0|app       | data not come

// var h1 = '11:08:00 AM'
// var time12h=h1 // time change in 24hr
// const [time, modifier] = time12h.split(' ');
// let [hours, minutes] = time.split(':');
// if (hours === '12') {
//   hours = '00';
// }
// if (modifier === 'PM') {
//   hours = parseInt(hours, 10) + 12;
// }



// run
// 0|app  | 4/21/2021, 11:59:00 AM dt
// 0|app  | 4/21/2021  11:59:00 AM split_td
// 0|app  | [ '', '11:59:00', 'AM' ] 24hour_am_pm
// 0|app  | [ '' ] hour_m
// 0|app  | { hour: '', min: 'undefined' }
// 0|app  |  undefined
// 0|app  | 2021 3 21  undefined 0 0
// 0|app  | Invalid Date cur
// 0|app  | data not come

        
        var time12h=h[1] // time change in 24hr
        var tisp = time12h.split(' ');
        const [b,time, modifier] = time12h.split(' ');
        var ti = time.split(':')
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      console.log(msg= {hour:`${hours}`,min:`${minutes}`})
      console.log(msg.hour,msg.min)
    
        var y = d[2]
        var mo = parseInt(dateary[0])-1
        var d = parseInt(dateary[1])
        var h = msg.hour
        var mi = msg.min
        var se = '0'
        var mil = '0'
        var curdat = new Date(y,mo,d,h,mi,se,mil)

        emailsentsave.aggregate([
            {
                $match: {
                    $and: [{ email_status: true },{email_type:'schedule'},
                    { $expr: { $eq: [{ $month: '$DateT' }, { $month: curdat }] } },
                    { $expr: { $eq: [{ $dayOfMonth: '$DateT' }, { $dayOfMonth: curdat }] } },
                    { $expr: { $eq: [{ $year: '$DateT' }, { $year: curdat }] } },
                    { $expr: { $eq: [{ $hour: '$DateT' }, { $hour: curdat }] } },
                    { $expr: { $eq: [{ $minute: '$DateT' }, { $minute: curdat }] } },
                    ]
                }
            }
        ]).exec((err,resp)=>{
            if(resp.length >0){
            var Data = resp
            Data.forEach((row)=>{
                var to = row.to
                var from = row.from
                var sub = row.subject
                var template = row.template
                var dmy = row.DateT
                    const emailData = {
                        sendgrid_key:'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',
                        to:to,
                        from_email: from,
                        from_name: 'noreply@gmail.com',
                    };
                    emailData.subject = sub;
                    emailData.content = template;
                 
                    sgMail.send_via_sendgrid(emailData).then(resp => {
                        emailsentsave.findByIdAndUpdate(row._id, {$set:{email_type:'sent'}})
                            .exec((err, emailUpdate) => {
                                if (err) {
                                    res.send('email status is not update')
                                }
                                else {
                                    res.send('email sent successfully status schdule sent')
                                }
                            })
                    }).catch(err => {
                        res.send(err)
                    })
            })
  
        }
        else{
            console.log('data not come')
        }
})
})


// module.exports = corn.schedule('*/60 * * * * *',function(){
// EmailSent.find({$and:[{email_type:'schedule'},{email_status:true}]})
//     .exec((err,scheduleData)=>{
//         if(err){
//         }
//         else{
//             var Data = scheduleData
//             Data.forEach((row)=>{
//                 var Auth = row.email_auth_key
//                 var to = row.to
//                 var from = row.from
//                 var sub = row.subject
//                 var d = new Date(row.sent_date)
//                 var time = row.sent_time
//                 var tsplit = time.split(':')
//                 var date = d.getDate()
//                 var mon = d.getMonth()+1
//                 var hour = tsplit[0]
//                 var min = tsplit[1]

//                 corn.schedule(`${min} ${hour} ${date} ${mon} *`, function() {
//                     const emailData = {
//                         sendgrid_key:Auth,
//                         to:to,
//                         from_email: from,
//                         from_name: 'noreply@gmail.com',
//                     };
//                     emailData.subject = sub;
//                     emailData.content = '<h1>hello sir i am ok</h1>';
                 
//                     sgMail.send_via_sendgrid(emailData).then(resp => {
//                     EmailSent.findByIdAndUpdate(row._id, {$set:{email_type:'sent'}})
//                             .exec((err, emailUpdate) => {
//                                 if (err) {
//                                     res.send('email status is not update')
//                                 }
//                                 else {
//                                     res.send('email sent successfully status schdule sent')
//                                 }
//                             })
//                     }).catch(err => {
//                         res.send('email not send')
//                     })
//             })

//             })
//         }
//     })
// })

// module.exports = corn.schedule('*/30 * * * * *',function(){
//     textSentSave.find({$and:[{text_type:'schedule'},{textStatus:true}]})
//     .exec((err,txtData)=>{
//         if(err){
//             res.send('schedule data not found')
//         }
//         else{
//             var Data = txtData
//             Data.forEach((row)=>{
//                 var ACCOUNT_SID = process.env.ACCOUNT_SID
//                 var AUTH_TOKEN = process.env.AUTH_TOKEN
//                 var MSG_SERVICE_SID = process.env.MSG_SERVICE_SID
//                 var to = row.to
//                 var msg = row.msg
//                 var d = new Date(row.schedule_date)
//                 var date = d.getDate()
//                 var mon = d.getMonth()+1
//               var job = corn.schedule(`* * * ${date} ${mon} *`, function() {
                    
//                     function sendBulkMessages(msg,to){
//                         const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
//                         var numbers = []; 
//                         for(i = 0; i < to.length; i++) 
//                         { 
//                             numbers.push(JSON.stringify({  
//                             binding_type: 'sms', address: to[i]})) 
//                         } 
                       
//                         const notificationOpts = { 
//                           toBinding: numbers, 
//                           body: msg, 
//                         }; 

//                         client.notify 
//                         .services(process.env.SERVICE_SID) 
//                         .notifications.create(notificationOpts) 
//                         .then((resp)=>{
//                                textSentSave.findByIdAndUpdate(row._id,{text_type:'sent'})
//                               .exec((err,updatetxt)=>{
//                                    if(err){
//                                       res.send('schedule text sms not sent')
//                                    }
//                               else{

//                                   res.send('schedule text sms sent successfully')
//                                   job.stop()
//                                }
//                            })
//                         }).catch((error)=>{
//                             res.send(error)
//                         })
//                     }  
//                     sendBulkMessages(msg,to)

//                 })
//             })
//         }
//     })
// })





