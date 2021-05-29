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
// // console.log(data)
// //         //   var emailDetail =  new all_temp(obj)
// //         //   emailDetail.sent_date = data.Date
// //         //   emailDetail.sent_time = data.Time 
// //         var DT = '04/19/2021'   

// // var dz = new Date(`${data.Date} ${data.Time}`);
// // var t = dz.toISOString()
// // console.log(t)

// // var newDate =  new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
// // console.log(newDate)

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

//     console.log(a,'ffffsd')

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
//     console.log(h[0],h[1],'split_td')
//     var dates = h[0]
//     var d = dates.split('/')
//     var dateary = ['4','21','2021']
//     console.log(dateary,'fd')
//     var h1 = '11:08:00 AM'
    
//     var time12h=h1 // time change in 24hr
//     console.log(time12h,'fdh1111')
//     const [time, modifier] = time12h.split(' ');
//     let [hours, minutes] = time.split(':');
//     console.log(hours,minutes,'h','m')
//     if (hours === '12') {
//       hours = '00';
//     }
//     if (modifier === 'PM') {
//       hours = parseInt(hours, 10) + 12;
//     }
   
//     console.log(msg= {hour:`${hours}`,min:`${minutes}`})
//     console.log(msg.hour ,msg.min )

//     var y = dateary[2]
//     var mo = parseInt(dateary[0])-1
//     var d = parseInt(dateary[1])
//     var h = msg.hour
//     var mi = msg.min
//     var se = '0'
//     var mil = '0'
//     console.log(y,mo,d,h,mi,se,mil)
//     var curdat = new Date(y,mo,d,h,mi,se,mil)
    
//     console.log(curdat.getHours(),curdat.getMinutes(),curdat,'cur')

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
// // // console.log(d)
// // var nd = d.getDate()+follow

// // var nm = d.getMonth()
// // var ny = d.getFullYear()

// // var nD = new Date(`${nm} ${nd} ${ny} ${TI}`)
// // console.log(nD)
// // console.log(nD.getDate())
// // var dz = new Date(`${req.body.sent_date} ${req.body.sent_time}`);
// // const moment = require('moment');
// // var sent_date = '04/19/2021'
// // var sent_time = '15:33'
// // var date = new Date(`${sent_date} ${sent_time}`);
// // date.setDate(date.getDate() + follow);

// // var mT = moment(date).format('MM/DD/YYYY')    
// // // console.log(date,mT)

// client.messages.create({
//   to:'+919893600766',
//   from:'+12672637681',
//   body:'hy how are you jio'
// })
// .then((message)=>console.log(message))
// .catch((error)=>console.log(error))

// var to = ['989-360-0766']
// var msg ='without +91'
// var numbers = []; 
// for(i = 0; i < to.length; i++) 
// {   
//     console.log(`${'+91'+to[i]}`)
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
//     console.log(resp)
// }).catch((error)=>{
//     console.log(error)
// })

// from: '+12672637681',


// function TimeZone(){
//     const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//     const date_time =str.split(',')
//     console.log(date_time)
//     const date = date_time[0]
//     const time = date_time[1]
//     console.log({Date:date,Time:time})
//   }
  
//   TimeZone()

// var newD = new Date()
// console.log(newD)

// let date = new Date();
// date.setMonth(date.getMonth() - 1);
// let dateInput = date.toISOString();
// console.log(dateInput)

// var today = new Date()
// var priorDate = new Date().setDate(today.getDate()-30)
// var th = new Date(priorDate)
// console.log(th)



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
//     console.log('success',response)
    
//   console.log(JSON.stringify(response.data));
// })
// .catch(function (error) {
//     console.log('error')
//   console.log(error);
// });


// var ary = [1,2,3]
// var a = ary.map(myfunction) 

// console.log(a)

// function myfunction(val){
//     if(val>2){
//         return val
//     }
// }
// const sendgrid = require('sendgrid-v3-node');

// const mailOptions = {
//     sendgrid_key: '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',
//     from_email: 'info.xpresscure@gmail.com',
//     from_name: 'kumar',
//     to: 'tekeshwardevelopersveltosest@gmail.com' // REQUIRED: `string` email
// };

// mailOptions.subject = 'SUBJECT';
// mailOptions.content = 'CONTENT';
// sendgrid.send_via_sendgrid(mailOptions).then(response => {
//     console.log('success',response);
// }).catch((error)=>{
//     console.log(error)
// });


// var cart = [{
//     pid:[{objectId}],
//     qty:1,
//     total_qty:5,
//     userId:"xyz"
// }]

// for (i = 0; i < 10; i++) {
//     if (i === 4) { break; }
//     console.log(i)
//   }
// var array = [1,2,3,4,5]
// array.forEach(function(val, i){
//     if (val === 2) {
//       // how do we stop?
//       return true;
//     }
//     console.log(val); // your code
//   });

// console.log(Date.now().toString())


// var obj = {
//     name:'ram'
// }

// async function b(data1, callback){
//     callback(data1)
// }

// async function a(data){
//   await b(data, async function(m){
//     console.log('run')
//     console.log(m)
    
//   })
// }

// a(obj)

// var newd = new Date()
// var old = new Date()
// console.log(old,newd)

// var sub = (newd.getTime()-old.getTime())

// console.log(sub)

// function ab (){
// let x = 11 
// var age  = 18
// if(age>x){
//     let y = 12
//     console.log(x,y)
//      y = 13
// console.log(y)
// }

// }

// ab()

// var ary = ['a','b','c']

// const result =ary.reduce((accumlator,ary)=>{
//     return accumlator+ary 
// })
// console.log(result)

// var ary = [{name:'a'},{name:'b'}]

// var result = ary.reduce(myfunc)

// function myfunc(accumlator,ar){
//     return accumlator+ar
// }
// console.log(result)

// var myGirls = [{"name":"Cecilie"}];
// var myBoys = [{"userId":"123"}];
// var myChildren = myGirls.concat(myBoys);

// console.log(myChildren)

// var ary = ['a','b','c','d']

// console.log(ary)
// var res = ary.slice(1,3)
// console.log(res)
// getName()
// var x =9
// function getName(){
// console.log(x)
// }

// var ary = [1,2,3,3]

// var res = ary.filter((ele)=>{
//     if(ele>2){
//         return ele;
//     }
// })

// console.log(res)