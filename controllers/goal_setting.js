const goalsSetting = require("../models/goal_setting");
const { errorHandler } = require('../helpers/dbErrorHandler');
const url = require('url')

exports.goalSettingCreate = (req, res) => {
    const task = new goalsSetting(req.body);
    task.save((err, data) => {
        if (err) {
            res.send({ error: 'goals setting is not add' })
        }
        else {
            goals.findByIdAndUpdate({ _id: data._id }, { $set: { userId: req.params.userId } })
                .exec((err, goalData) => {
                    if (err) {
                        res.send({ error: 'user id is not add in goals' })
                    }
                    else {
                        res.send(task)
                    }
                })
        }
    });
};

exports.goalSettingread = (req, res) => {
    goalsSetting.find({ userId: req.params.userId })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.goalsettinginfo = (req, res) => {
    const id = req.params.goalId
    goalsSetting.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        });
};
exports.goalsettingupdate = (req, res) => {
    const id = req.params.goalId;
    goalsSetting.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            res.send("goal setting has been updated successfully")
        }).catch((err) => {
            res.send(err)
        })
};

exports.goalsettingremove = (req, res) => {
    const id = req.params.goalId
    goalsSetting.deleteOne({ _id: id })
        .then((resp) => {
            res.json("goal setting has been deleted successfully")
        }).catch((err) => {
            res.send(err)
        })
};

