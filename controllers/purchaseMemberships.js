const purchaseMembership = require("../models/purchaseMemberships");
const _ = require("lodash");
exports.buyMembership = async (req, res) => {
  try {
    let { userId, memberId } = req.params;
    let obj = {
      membership_duration: req.body.membership_duration,
      paymentType: req.body.paymentType,
      program_name: req.body.program_name,
      total_amount: req.body.total_amount,
      active_date: req.body.active_date,
      membership_status: req.body.membership_status,
      created_by: req.body.created_by,
      isEMI: req.body.isEMI,
      userId: userId,
      studentId: memberId,
    };

    if (obj.isEMI) {
      let emi_record = [
        {
          created_by: "stafName",
          date: "2/20/2022",
          amount: "$400",
        },
        {
          created_by: "stafName",
          date: "2/23/2020",
          amount: "$400",
        },
      ];
      obj.emi_record = emi_record;

      let obj1 = {
        paymentType: req.body.paymentType,
        emi_type: req.body.emi_type,
        number_of_emi: req.body.number_of_emi,
        down_payment: req.body.down_payment,
      };

      obj = _.extend(obj, obj1);

      const purchaseData = new purchaseMembership(obj);

      purchaseData.save((err, data) => {
        if (err) {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
          res.status(200).send({ data: data, success: true });
        }
      });
    } else {
      let obj1={
        due_status : "paid"
      }
      obj=_.extend(obj,obj1)
      let purchaseData = new purchaseMembership(obj);

      purchaseData.save((err, data) => {
        if (err) {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
          res.status(200).send({ data: data, success: true });
        }
      });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};
