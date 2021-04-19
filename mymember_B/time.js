// function timefun(){
// var DT = new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
// var TimeDate = DT.split(',')
// var date=TimeDate[0]
// var time12h=TimeDate[1]

// const [b,time, modifier] = time12h.split(' ');

// let [hours, minutes] = time.split(':');
// if (hours === '12') {
//   hours = '00';
// }
// if (modifier === 'PM') {
//   hours = parseInt(hours, 10) + 12;
// }
// return({Date:date,Time:`${hours}:${minutes}`})

// }
// var data = timefun()      
// console.log(data)
//         //   var emailDetail =  new all_temp(obj)
//         //   emailDetail.sent_date = data.Date
//         //   emailDetail.sent_time = data.Time 
//         var DT = '04/19/2021'   

// var dz = new Date(`${data.Date} ${data.Time}`);
// var t = dz.toISOString()
// console.log(t)

// var newDate =  new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
// console.log(newDate)



// let options = {
//     timeZone: 'Asia/Kolkata',
//     hour: 'numeric',
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     },
//     formatter = new Intl.DateTimeFormat([], options);
//     var a =(formatter.format(new Date()));
//     var str = a
//     var h = str.split(",");
//     console.log(h[0],h[1])
//     var dates = h[0]
//     var d = dates.split('/')
//     var curdat = new Date(`${d[1]} ${d[0]} ${d[2]} ${h[1]}`)
//     console.log(curdat.getMonth())
var TI = '15:25'
var follow = 0
// var d = new Date()
// // console.log(d)
// var nd = d.getDate()+follow

// var nm = d.getMonth()
// var ny = d.getFullYear()

// var nD = new Date(`${nm} ${nd} ${ny} ${TI}`)
// console.log(nD)
// console.log(nD.getDate())
// var dz = new Date(`${req.body.sent_date} ${req.body.sent_time}`);
const moment = require('moment');
var sent_date = '04/19/2021'
var sent_time = '15:33'
var date = new Date(`${sent_date} ${sent_time}`);
date.setDate(date.getDate() + follow);

var mT = moment(date).format('MM/DD/YYYY')    
console.log(date,mT)