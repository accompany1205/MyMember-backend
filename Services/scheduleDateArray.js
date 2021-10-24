const moment = require('moment')
function ScheduleDateArray(startDate, payments) {
    arr = []
    let i = 0
    while (i < payments) {
        arr.push(moment(startDate).add(i, 'M').format("YYYY/MM/DD"))
        i++;
    }
    return arr
}


module.exports = ScheduleDateArray