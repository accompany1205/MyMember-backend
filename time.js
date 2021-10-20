// // function timefun(){
// // var DT = new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
// // var TimeDate = DT.split(',')
// // var date=TimeDate[0]
// // var time12h=TimeDate[1]

// // const [b,time, modifier] = time12h.split(' ');

// // let [hours, minutes] = time.split(':');
// // if (hours === '12') {
// //   hours = '00';
// // }
// // if (modifier === 'PM') {
// //   hours = parseInt(hours, 10) + 12;
// // }
// // return({Date:date,Time:`${hours}:${minutes}`})

// // }
// // var data = timefun()      
// //         //   var emailDetail =  new all_temp(obj)
// //         //   emailDetail.sent_date = data.Date
// //         //   emailDetail.sent_time = data.Time 
// //         var DT = '04/19/2021'   

// // var dz = new Date(`${data.Date} ${data.Time}`);
// // var t = dz.toISOString()

// // var newDate =  new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})

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


//     // var TimeDate = DT.split(',')
//     // var date=TimeDate[0]
//     // var time12h=TimeDate[1]
//     // const [b,time, modifier] = time12h.split(' ');
   
//     // let [hours, minutes] = time.split(':');
//     // if (hours === '12') {
//     //   hours = '00';
//     // }
//     // if (modifier === 'PM') {
//     //   hours = parseInt(hours, 10) + 12;
//     // }
//     // return({Date:date,Time:`${hours}:${minutes}`})
    

// // 4/21/2021, 11:08:00 AM dt
// // 0|app       | 4/21/2021  11:08:00 AM split_td
// // 0|app       | [ ' 11', '08', '00 AM' ] splitT
// // 0|app       | 2021 20 4  11 08 0 0
// // 0|app       | 2022-09-04T11:08:00.000Z cur
// // 0|app       | data not come

    
//     var str = a
//     var h = str.split(",");
//     var dates = h[0]
//     var d = dates.split('/')
//     var dateary = ['4','21','2021']
//     var h1 = '11:08:00 AM'
    
//     var time12h=h1 // time change in 24hr
//     const [time, modifier] = time12h.split(' ');
//     let [hours, minutes] = time.split(':');
//     if (hours === '12') {
//       hours = '00';
//     }
//     if (modifier === 'PM') {
//       hours = parseInt(hours, 10) + 12;
//     }
   

//     var y = dateary[2]
//     var mo = parseInt(dateary[0])-1
//     var d = parseInt(dateary[1])
//     var h = msg.hour
//     var mi = msg.min
//     var se = '0'
//     var mil = '0'
//     var curdat = new Date(y,mo,d,h,mi,se,mil)
    

//     // var y ='2021'
//     // var mo = '4'
//     // var d = '20'
//     // var h = '11'
//     // var mi = '04'
//     // var se = '0'
//     // var mil = '0'


//     // new Date(year, month, day, hours, minutes, seconds, milliseconds)

        
// var TI = '15:25'
// var follow = 0
// // var d = new Date()
// // var nd = d.getDate()+follow

// // var nm = d.getMonth()
// // var ny = d.getFullYear()

// // var nD = new Date(`${nm} ${nd} ${ny} ${TI}`)
// // var dz = new Date(`${req.body.sent_date} ${req.body.sent_time}`);
// // const moment = require('moment');
// // var sent_date = '04/19/2021'
// // var sent_time = '15:33'
// // var date = new Date(`${sent_date} ${sent_time}`);
// // date.setDate(date.getDate() + follow);

// // var mT = moment(date).format('MM/DD/YYYY')    

// const asid = 'AC95c8e5b269c098f81fac4bbc8ce8f881';
// const authtoken = 'af2e5bd3153fe38cd556686959194c48'
// const msgService = 'ISb21aa5fdf2d5a8c60dd25d5dd7389d7f'
// const client = require('twilio')(asid, authtoken)

// // client.messages.create({
// //   to:'+919893600766',
// //   from:'+12672637681',
// //   body:'hy how are you jio'
// // })

// var to = ['989-360-0766']
// var msg ='without +91'
// var numbers = []; 
// for(i = 0; i < to.length; i++) 
// {   
//     numbers.push(JSON.stringify({  
//     binding_type: 'sms', address: `${'+91'+to[i]}`})) 
// } 

// const notificationOpts = { 
//   toBinding: numbers, 
//   body: msg, 
// }; 

//  client.notify 
// .services(msgService) 
// .notifications.create(notificationOpts) 
// .then((resp)=>{
// }).catch((error)=>{
// })

// from: '+12672637681',


// function TimeZone(){
//     const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//     const date_time =str.split(',')
//     const date = date_time[0]
//     const time = date_time[1]
//   }
  
//   TimeZone()

// var newD = new Date()

// let date = new Date();
// date.setMonth(date.getMonth() - 1);
// let dateInput = date.toISOString();

// var today = new Date()
// var priorDate = new Date().setDate(today.getDate()-30)
// var th = new Date(priorDate)



// var axios = require('axios');
// var FormData = require('form-data');
// var data = new FormData();
// data.append('app_id', '464DA39FCFB44D54F6C1D22CEF9098E5');
// data.append('auth_token', '8E1DDE8DE369812732E88C583B14D0C4');
// data.append('auth_key', '15B8BCFDB337428792608354A1444050');
// data.append('uid', '1234567890');
// data.append('mtype', '0200');
// data.append('amount', '11.00');
// data.append('pan', '4111111111111111');
// data.append('expiry_date', '1223');
// data.append('card_holder_name', 'ABUBACKER N');
// data.append('address', '3636 33rd st');
// data.append('zip', '11106');
// data.append('epi', '2104714588');
// data.append('tip', '');
// data.append('custom_fee', '');
// data.append('cvv', '999');
// data.append('surchargeIndicator', '1');

// var config = {
//   method: 'post',
//   url: 'https://vt.isoaccess.com:4430',
//   headers: { 
//     ...data.getHeaders()
//   },
//   data : data
// };

// axios(config)
// .then(function (response) {
    
// })
// .catch(function (error) {
// });


// var ary = [1,2,3]
// var a = ary.map(myfunction) 


// function myfunction(val){
//     if(val>2){
//         return val
//     }
// }

