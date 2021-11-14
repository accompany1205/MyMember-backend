const moment = require('moment')
function ScheduleDateArray(startDate, payments, money, paymentArr, payMode) {
    schedueDateArray = []
    current_Date = moment().format("YYYY-MM-DD")
    i = 0
    parseInt(paymentArr)
    // const startPaymentDate = moment(startDate).format("MM/DD/YYYY")
    while (i < payments) {
        obj = {}
        i++;
        if (payMode == 'monthly') {
            date = moment(startDate).add(i, 'M').format("YYYY-MM-DD")
            obj['date'] = date
            obj['payment_money'] = money
            if (moment(current_Date).isSameOrAfter(date)) {
                if (paymentArr[i - 1]) {
                    obj['status'] = 'paid'
                    EmiCompleted++
                } else {
                    obj['status'] = 'overdue'
                }
            }
            else {
                obj['status'] = 'due'
            }
        }else{
            date = moment(startDate).add(7*i, 'd').format("YYYY-MM-DD")
            obj['date'] = date
            obj['payment_money'] = money
            if (moment(current_Date).isSameOrAfter(date)) {
                if (paymentArr[i - 1]) {
                    obj['status'] = 'paid'
                
                } else {
                    obj['status'] = 'overdue'
                }
            }
            else {
                obj['status'] = 'due'
            }

        }
        schedueDateArray.push(obj)

    }
    return schedueDateArray
}

// payarr=new Array(5).fill(true)

// console.log(ScheduleDateArray('2021-10-19',5,'5000',payarr,'weekly'))
// console.log(moment('2021-10-26').add(7, 'd').format('YYYY/MM/dddd'))
module.exports = ScheduleDateArray



