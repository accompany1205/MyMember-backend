const tasks = require("../models/todo_schema");
const user = require("../models/user")
const { errorHandler } = require('../helpers/dbErrorHandler');
const url = require('url')
// const todo = require("../models/todo_schema")


exports.todoCreate = (req, res) => {
    const Id = req.params.userId
    const task = new tasks(req.body);
    console.log("-->", task);
    task.save((err, data) => {
        if (err) {
            res.send("todo not add")
        } else {
            tasks.findByIdAndUpdate({ _id: data._id }, { $set: { userId: Id } }).exec((err, todoData) => {
                if (err) {
                    res.send({ error: 'user id is not add in todo' })
                }
                else {
                    res.send({ msg: 'todo add successfully' })
                }
            })

        }
    });
};

exports.taskread = (req, res) => {
    tasks.find({ userId: req.params.userId })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
}

exports.taskinfo = async (req, res) => {
    const id = req.params.todoId
    tasks.findById(id)
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
}

exports.update = (req, res) => {
    const id = req.params.todoId;
    tasks.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {
            res.send(update_resp)
        }).catch((err) => {
            res.send(err)
        })
}

exports.remove = (req, res) => {
    const id = req.params.todoId;
    tasks.deleteOne({ _id: id })
        .then((resp) => {
            res.json(resp)
        }).catch((err) => {
            res.send(err)
        })
}

exports.weekTaskRead = async (req, res) => {

    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
        limit: per_page,
        skip: per_page * page_no,
    };
    let currentDate = new Date();
    let cDate = ("0" + currentDate.getDate()).slice(-2);
    let cMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    let cYear = currentDate.getFullYear();
    let currentDateTodo = `${cYear}-${cMonth}-${cDate}`;

    let previosWeekStartingDate = new Date();
    previosWeekStartingDate.setDate(currentDate.getDate() - 7);
    let lDate = ("0" + previosWeekStartingDate.getDate()).slice(-2);
    let lMonth = ("0" + (previosWeekStartingDate.getMonth() + 1)).slice(-2);
    let lYear = previosWeekStartingDate.getFullYear();
    let previousWeekdayTodo = `${lYear}-${lMonth}-${lDate}`;
    var totalCount = await tasks
        .find({
            userId: req.params.userId,
            todoDate: { $gte: (previousWeekdayTodo), $lt: (currentDateTodo) }
        })
        .countDocuments();

    tasks.find({ userId: req.params.userId, todoDate: { $gte: (previousWeekdayTodo), $lt: (currentDateTodo) } })
        .limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
            res.send({ result, totalCount: totalCount })
        }).catch((err) => {
            res.send(err)
        })

}

exports.today_taskread = async (req, res) => {
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
        limit: per_page,
        skip: per_page * page_no,
    };
    let todayDate = new Date()
    // current date
    // adjust 0 before single digit date
    let date = ("0" + todayDate.getDate()).slice(-2);

    // current month
    // let month = todayDate.toLocaleString('default', { month: 'long' })

    let month = ("0" + (todayDate.getMonth() + 1)).slice(-2);

    // current year
    let year = todayDate.getFullYear();

    var newtodoDate = `${year}-${month}-${date}`;
    var totalCount = await tasks
        .find({
            userId: req.params.userId,
            todoDate: newtodoDate
        })
        .countDocuments();

    tasks.find({ userId: req.params.userId, todoDate: newtodoDate })
        .limit(pagination.limit)
        .skip(pagination.skip)
        .then((result) => {
            res.send({ result, totalCount: totalCount })
        }).catch((err) => {
            res.send(err)
        })
}

exports.tomorrow_taskread = (req, res) => {
    let todayDate = new Date()
    // current date
    // adjust 0 before single digit
    let date = todayDate.getDate() + 1;

    // current month
    //let month = todayDate.toLocaleString('default', { month: 'long' })  
    let month = ("0" + (todayDate.getMonth() + 1)).slice(-2);

    // current year
    let year = todayDate.getFullYear();

    var newtodoDate = `${year}-${month}-${date}`;

    tasks.find({ userId: req.params.userId, todoDate: newtodoDate })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
}

exports.completed_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, status: "Completed" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.not_completed_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, status: "Not Completed" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.events_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, tag: "Events" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.business_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, tag: "Business" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.personal_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, tag: "Personal" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.appointment_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId, tag: "Appointment" })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.searching_task = (req, res) => {

    const all = url.parse(req.url, true).query


    let searchKeyWord = new RegExp(".*" + all.q + ".*", 'i');

    tasks.find({
        $and: [{
            $or: [{ subject: searchKeyWord }, { todoDate: searchKeyWord }, { todoTime: searchKeyWord },
            { tag: searchKeyWord }, { status: searchKeyWord }, { notes: searchKeyWord }]
        },
        { userId: req.params.userId }]
    })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.upcoming_taskread = async (req, res) => {
    try {
        tasks.aggregate(
            [{ $match: { userId: req.params.userId }, },
            {
                $project: {
                    notes: 1,
                    status: 1,
                    subject: 1,
                    tag: 1,
                    todoTime: 1,
                    createdAt: 1,
                    todoDate: 1,
                    todoDate: { $dateFromString: { dateString: "$todoDate" } },
                }
            },
            {
                $match: {

                    todoDate: { $gte: new Date }
                }
            }
            ])
            .exec((err, memberdata) => {
                if (err) {
                    res.send({
                        error: err,
                        success: false
                    });
                } else {
                    res.send({ cart: memberdata, success: true });
                }
            });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}
