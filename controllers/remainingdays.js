const moment=require('moment')
function daysRemaining(date,start) {
    var eventdate = moment(date)
    var todaysdate = moment(start).format("YYYY-MM-DD");
    return eventdate.diff(todaysdate, 'days');
}


module.exports=daysRemaining


