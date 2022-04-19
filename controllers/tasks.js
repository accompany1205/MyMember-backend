const taskSubFolder = require("../models/task_subfolder");
const taskFolder = require('../models/task_folder')
const tasks = require('../models/task')

exports.Create = async (req, res) => {
    const Task = req.body;
    let userId = req.params.userId;
    let subfolderId = req.params.subfolderId;
    Task.userId = userId;
    Task.subfolderId = subfolderId;
    let dateRanges = Task.repeatedDates;
    try {
        let allTasks = [];
        if (dateRanges.length > 1) {

            for (let dates in dateRanges) {
                let newTask = { ...Task, start: dateRanges[dates], end: dateRanges[dates], repeatedDates: dateRanges };
                allTasks.push(newTask);
            }
            let resp = await tasks.insertMany(allTasks);
            let rest = await [...(resp.map(element => element._id))];
            if (rest.length) {
                taskSubFolder.findByIdAndUpdate(subfolderId,
                    {
                        $push: { tasks: rest },
                    }, (err, data) => {
                        if (err) {
                            res.send({
                                msg: 'Task not added in folder', success: false,
                            });
                        } else {
                            res.send({ success: true, msg: "Task added!", });
                        }
                    }
                );

            } else {
                res.send({ success: false, msg: "Task not created!", });

            }
        } else {
            const task = new tasks(Task);
            task.save((err, taskData) => {
                if (err) {
                    res.send({ msg: "Task is not added", success: err });
                } else {
                    taskSubFolder.findByIdAndUpdate(subfolderId,
                        {
                            $push: { tasks: taskData._id },
                        }, (err, data) => {
                            if (err) {
                                res.send({
                                    msg: 'task not added in folder', success: false,
                                });
                            } else {
                                res.send({ success: true, msg: "Task added!", });
                            }
                        }
                    );
                }
            });
        }
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
};



exports.remove = (req, res) => {
    const taskId = req.params.taskId;
    try {
        tasks.findOneAndRemove(
            { _id: taskId }, (err, data) => {
                if (err) {
                    res.send({ msg: 'task is not removed', success: false });
                } else {
                    taskSubFolder.updateOne(
                        { tasks: taskId },
                        { $pull: { tasks: taskId } }, (err, temp) => {
                            if (err) {
                                res.send({
                                    msg: 'task not removed',
                                    success: false,
                                });
                            } else {
                                res.send({
                                    msg: 'task removed successfully',
                                    success: true,
                                });
                            }
                        }
                    );
                }
            }
        );
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false });
    }
};

exports.tasksUpdate = async (req, res) => {
    try {
        var taskData = req.body;
        const taskId = req.params.taskId;
        await tasks.updateOne(
            { _id: taskId },
            { $set: taskData }
        )
            .exec(async (err, data) => {
                if (err) {
                    res.send({
                        msg: err,
                        success: false,
                    });
                } else {
                    res.send({
                        msg: 'task updated successfully',
                        success: true,
                    });
                }
            });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false });
    }
};
