const tasks = require("../models/todo_schema");
const user = require("../models/user")
const { errorHandler } = require('../helpers/dbErrorHandler');
// const todo = require("../models/todo_schema")


exports.todoCreate = (req, res) => {
    const Id = req.params.userId
    const task = new tasks(req.body);
    console.log(req.body, Id)
    task.save((err, data) => {
        if (err) {
            res.send("todo not add")
            console.log(err)
        } else {
            console.log(data)
            tasks.findByIdAndUpdate({ _id: data._id }, { $set: { userId: Id } }).exec((err, todoData) => {
                if (err) {
                    res.send({ error: 'user id is not add in todo' })
                }
                else {
                    res.send({ msg: 'todo add successfully' })
                    console.log(todoData)
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
            console.log(update_resp)
            res.send(update_resp)
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
}

exports.remove = (req, res) => {
    const id = req.params.todoId;
    tasks.deleteOne({ _id: id })
        .then((resp) => {
            res.json(resp)
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
}


exports.today_taskread = (req, res) => {
    var todayDate = new Date()
    // current date
    // adjust 0 before single digit date
    let date = ("0" + todayDate.getDate()).slice(-2);

    // current month
   // let month = todayDate.toLocaleString('default', { month: 'long' })

    let month = ("0" + (todayDate.getMonth() + 1)).slice(-2);

    // current year
    let year = todayDate.getFullYear();

    var newtodoDate = `${year}-${month}-${date}`;

    console.log(newtodoDate)
    tasks.find({ userId: req.params.userId, todoDate: newtodoDate })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
}

exports.tomorrow_taskread = (req, res) => {
    var todayDate = new Date()
    // current date
    // adjust 0 before single digit
    let date = todayDate.getDate() + 1;

    // current month
    //let month = todayDate.toLocaleString('default', { month: 'long' })  
    let month = ("0" + (todayDate.getMonth() + 1)).slice(-2);

    // current year
    let year = todayDate.getFullYear();

    var newtodoDate = `${year}-${month}-${date}`;

    console.log(newtodoDate)
    tasks.find({ userId: req.params.userId, todoDate: newtodoDate })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
}

exports.completed_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,status : "Completed"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })

}

exports.not_completed_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,status : "Not Completed"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
        
}

exports.events_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,tag : "Events"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
        
}

exports.business_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,tag : "Business"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
        
}

exports.personal_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,tag : "Personal"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
        
}

exports.appointment_taskread = (req, res) => {

    tasks.find({ userId: req.params.userId ,tag : "Appointment"})
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            res.send(err)
        })
        
}
