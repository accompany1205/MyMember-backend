const moment=require('moment')
function createEMIRecord(noOfEMi, Balance, activationDate, createdBy, payMode) {
    let perEmi = Balance / noOfEMi;
    arr = [];
    let i = 0;
    while (i < noOfEMi) {
      i++;
      let obj = {};
      if (payMode == "monthly") {
        obj.date = moment(activationDate).add(i, "M").format("YYYY-MM-DD");
        obj.Status = "due";
        obj.Amount = perEmi;
        obj.createdBy = createdBy;
      } else {
        if (payMode == "weekly") {
          obj.date = moment(activationDate).add(7 * i, "d").format("YYYY-MM-DD");
          obj.Status = "due";
          obj.Amount = perEmi;
          obj.createdBy = createdBy;
        }
      }
      arr.push(obj);
    }
    return arr;
  }
module.exports = createEMIRecord
