const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

function createEMIRecord(noOfEMi, Balance, activationDate, createdBy, payMode) {
  arr = [];
  let i = 0;
  createdBy=""
  while (i < noOfEMi) {
    i++;
    let obj = {};
    if (payMode == "monthly") {
      obj.date = moment(activationDate).add(i, "M").format("YYYY-MM-DD");
      obj.Id = uuidv4();
      obj.Amount = Balance;
      obj.createdBy = createdBy;
    } else {
      if (payMode == "weekly") {
        obj.date = moment(activationDate)
          .add(7 * i, "d")
          .format("YYYY-MM-DD");
        obj.Id = uuidv4();
        obj.Amount = Balance;
        obj.createdBy = createdBy;
      }
    }
    arr.push(obj);
  }
  return arr;
}
module.exports = createEMIRecord;
