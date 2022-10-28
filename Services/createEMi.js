const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

function createEMIRecord(
  noOfEMi,
  Balance,
  activationDate,
  createdBy,
  payMode,
  payLatter,
  due_every,
  studentId,
  userId
) {
  arr = [];
  let i = 0;
  createdBy = "";
  if (payMode == "monthly") {
    const date = activationDate.split("-");
    if (parseInt(due_every) < 10) {
      due_every = `0${due_every}`;
    }
    activationDate = date[0] + date[1] + due_every;
  }
  while (i < noOfEMi) {
    i++;
    let obj = {};
    if (payMode == "monthly") {
      obj.date = moment(activationDate).add(i, "M").format("YYYY-MM-DD");
      obj.Id = uuidv4();
      obj.Amount = Balance;
      obj.status = "due";
      obj.ptype = payLatter;
      obj.createdBy = createdBy;
      obj.studentId = studentId;
      obj.userId = userId;
    } else {
      if (payMode == "weekly") {
        obj.date = moment(activationDate)
          .add(7 * i, "d")
          .format("YYYY-MM-DD");
        obj.Id = uuidv4();
        obj.Amount = Balance;
        obj.status = "due";
        obj.ptype = payLatter;
        obj.createdBy = createdBy;
        obj.studentId = studentId;
        obj.userId = userId;
      }
    }
    arr.push(obj);
  }
  return arr;
}
module.exports = createEMIRecord;
