const purchaseMembership = require("../models/purchaseMemberships");
const _ = require("lodash");
var addmemberModal = require("../models/addmember");
const createEMIRecord = require("../Services/createEMi");
const cron = require("node-cron");
const moment = require("moment");
exports.getpurchaseMembership = async (req, res) => {
  try {
    let { userId, memberId } = req.params;
    const data = await purchaseMembership.findById(memberId, req.body);
    res.status(200).send({ msg: data, success: true });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

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
      //   paymentArr = new Array(duration).fill().map((e, i) => {
      //     i++
      //     return _.invert({ false: `${i}_installment` })
      // });

      let obj1 = {
        paymentType: req.body.paymentType,
        emi_type: req.body.emi_type,
        number_of_emi: req.body.number_of_emi,
        down_payment: req.body.down_payment,
      };
      // console.log(createEMIRecord(5, 110, "2021-05-02", "staff", "monthly"));
      // ScheduleDateArray(active_date, obj1.number_of_emi, Amount, paymentArr, paymentMode)
      obj.emi_record = createEMIRecord(
        obj1.number_of_emi,
        obj.total_amount,
        obj.active_date,
        obj.created_by,
        obj1.emi_type
      );

      obj = _.extend(obj, obj1);

      const purchaseData = new purchaseMembership(obj);

      purchaseData.save((err, data) => {
        if (err) {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
          addmemberModal.findByIdAndUpdate(memberId ,{ status: "active" }, (err, stdData) => {
            if (err) {
              res.send({ error: "membership not activated" });
            } else {
              res.status(200).send({ data: data, success: true });
            }
          });
          // res.status(200).send({ data: data, success: true });
        }
      });
    } else {
      let obj1 = {
        due_status: "paid",
      };
      obj = _.extend(obj, obj1);
      let purchaseData = new purchaseMembership(obj);

      purchaseData.save((err, data) => {
        if (err) {
          res.send({ error: err.message.replace(/\"/g, ""), success: false });
        } else {
      
          addmemberModal.findByIdAndUpdate(memberId ,{ status: "active" }, (err, stdData) => {
            if (err) {
              res.send({ error: "membership not activated" });
            } else {
              res.status(200).send({ data: data, success: true });
            }
          });
        }
      });
    }
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

exports.updatepurchaseMembership = async (req, res) => {
  try {
    let { userId, membershipId } = req.params;
    await purchaseMembership.findByIdAndUpdate(membershipId, req.body);
    res
      .status(200)
      .send({ msg: "membership updated Successfully", success: true });
  } catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false });
  }
};

