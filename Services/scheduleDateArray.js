const moment = require('moment')
function ScheduleDateArray(startDate, payments) {
    arr = []
    let i = 0
    while (i < payments) {
        arr.push(moment(startDate).add(i, 'M').format("MM/DD/YYYY"))
        i++;
    }
    return arr
}


module.exports = ScheduleDateArray