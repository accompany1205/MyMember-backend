const goals = require("../models/goals");
const { errorHandler } = require('../helpers/dbErrorHandler');
const url = require('url')

exports.goalCreate = (req, res) => {
    const task = new goals(req.body);
    task.save((err, data) => {
        if (err) {
            res.send({ error: 'goals is not add' })
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

exports.goalread = (req, res) => {
    goals.find({ userId: req.params.userId })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.goalinfo = (req, res) => {
    const id = req.params.goalId
    goals.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        });
};
exports.goalupdate = (req, res) => {
    const id = req.params.goalId;
    goals.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            res.send("goal has been updated successfully")
        }).catch((err) => {
            res.send(err)
        })
};

exports.goalremove = (req, res) => {
    const id = req.params.goalId
    goals.deleteOne({ _id: id })
        .then((resp) => {
            res.json("goal has been deleted successfully")
        }).catch((err) => {
            res.send(err)
        })
};

exports.weekly_goalread = (req, res) => {
    goals.find({ userId: req.params.userId, goal_category: "Weekly Goal" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.monthly_goalread = (req, res) => {
    goals.find({ userId: req.params.userId, goal_category: "Monthly Goal" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.quaterly_goalread = (req, res) => {
    goals.find({ userId: req.params.userId, goal_category: "Quaterly Goal" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.annual_goalread = (req, res) => {
    goals.find({ userId: req.params.userId, goal_category: "Annual Goal" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};


exports.searching_goal = (req, res) => {

    const all = url.parse(req.url, true).query


    let searchKeyWord = new RegExp(".*" + all.q + ".*", 'i');

    goals.find({
        $and: [{
            $or: [{ subject: searchKeyWord }, { goal_category: searchKeyWord }, { compeleting_Date: searchKeyWord },
            { reminder_Date: searchKeyWord }, { tag: searchKeyWord }, { goal_status: searchKeyWord },
            { notes: searchKeyWord }]
        },
        { userId: req.params.userId }]
    })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

/// counters
exports.weekly_goal_counter = (req, res) => {

    let weeklyCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_category: "Weekly Goal" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        weeklyCount = docCount
        res.json({ count: weeklyCount })
    })

};

exports.monthly_goal_counter = (req, res) => {

    let monthlyCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_category: "Monthly Goal" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        monthlyCount = docCount
        res.json({ count: monthlyCount })
    })

};

exports.quaterly_goal_counter = (req, res) => {

    let quaterlyCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_category: "Quaterly Goal" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        quaterlyCount = docCount
        res.json({ count: quaterlyCount })
    })

};


exports.annual_goal_counter = (req, res) => {

    let annualCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_category: "Annual Goal" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        annualCount = docCount
        res.json({ count: annualCount })
    })

};

exports.completed_goal_counter = (req, res) => {

    let completedCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_status: "Completed" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        completedCount = docCount
        res.json({ count: completedCount })
    })

};

exports.not_completed_goal_counter = (req, res) => {

    let notCompletedCount = 0

    goals.countDocuments({ userId: req.params.userId, goal_status: "Not Completed" }, function (
        err,
        docCount
    ) {
        if (err) {
            return handleError(err)
        }
        notCompletedCount = docCount
        res.json({ count: notCompletedCount })
    })

};

exports.this_month_pending_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Pending" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: { $eq: [{ $month: "$compeleting_Date" }, { $month: "$$NOW" }] },
            },
        }
    ])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.this_week_pending_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Pending" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $eq: [{ $week: "$compeleting_Date" }, { $week: "$$NOW" }]
                },
            },
        }
    ])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.today_pending_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Pending" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: '$compeleting_Date' }, { $dayOfMonth: new Date() }] },
                        { $eq: [{ $month: '$compeleting_Date' }, { $month: new Date() }] },
                        { $eq: [{ $year: '$compeleting_Date' }, { $year: new Date() }] },

                    ]
                }
            },
        }
    ])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};

exports.this_month_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: { $eq: [{ $month: "$compeleting_Date" }, { $month: "$$NOW" }] },
            },
        }])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.this_week_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $eq: [{ $week: "$compeleting_Date" }, { $week: "$$NOW" }]
                }
            },
        }])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.today_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: '$compeleting_Date' }, { $dayOfMonth: new Date() }] },
                        { $eq: [{ $month: '$compeleting_Date' }, { $month: new Date() }] },
                        { $eq: [{ $year: '$compeleting_Date' }, { $year: new Date() }] },

                    ]
                }
            }
        }])
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.this_month_not_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Not Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: { $eq: [{ $month: "$compeleting_Date" }, { $month: "$$NOW" }] },
            },
        }]).then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.this_week_not_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Not Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $eq: [{ $week: "$compeleting_Date" }, { $week: "$$NOW" }]
                }
            },
        }]).then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};
exports.today_not_completed_goals = (req, res) => {
    const userId = req.params.userId
    goals.aggregate([
        { $match: { userId: userId, goal_status: "Not Completed" } },

        {
            $project: {
                subject: 1,
                goal_category: 1,
                compeleting_Date: 1,
                reminder_Date: 1,
                tag: 1,
                goal_status: 1,
                compeleting_Date: { $toDate: "$compeleting_Date" },
                notes: 1,
            }
        },
        {
            $match: {
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: '$compeleting_Date' }, { $dayOfMonth: new Date() }] },
                        { $eq: [{ $month: '$compeleting_Date' }, { $month: new Date() }] },
                        { $eq: [{ $year: '$compeleting_Date' }, { $year: new Date() }] },

                    ]
                }
            }
        }]).then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
};


