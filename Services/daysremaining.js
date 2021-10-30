const moment=require('moment')
function daysRemaining(date) {
    var eventdate = moment(date)
    var todaysdate = moment().format("YYYY-MM-DD");
    return eventdate.diff(todaysdate, 'days');
}




// console.log(daysRemaining('2021-10-20'))

module.exports=daysRemaining