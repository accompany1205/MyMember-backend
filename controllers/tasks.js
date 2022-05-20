const taskSubFolder = require("../models/task_subfolder");
const taskFolder = require('../models/task_folder')
const tasks = require('../models/task')
const cloudUrl = require("../gcloud/imageUrl");

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
        const promises = []
        if (req.files) {
            (req.files).map(file => {
                promises.push(cloudUrl.imageUrl(file))
            });
            const docs = await Promise.all(promises);
            taskData.document = docs;
        }
        tasks.updateOne(
            { _id: taskId },
            { $set: taskData })
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

exports.todayTask = async (req, res) => {
    const userId = req.params.userId;
    const date = new Date

    try {

        let cDate = ("0" + (date.getDate())).slice(-2);
        let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
        let cYear = date.getFullYear();
        let currentDate = `${cMonth}-${cDate}-${cYear}`;
        console.log(currentDate)
        tasks.find(
            { start: currentDate }
        ).populate({
            path: "subfolderId",
            select: "subFolderName",

            populate: {
                select: "folderName",
                path: "folderId",
                model: "taskfolder"
            }
        })
            .then((result) => {
                res.send({ success: true, data: result })
            }).catch((err) => {
                res.send(err)
            })

    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
}

exports.taskFilter = async (req, res) => {
    const userId = req.params.userId;


    let { filter, byTime } = req.body;
    filter = filter ? filter : {}
    filter.userId = userId
    const date = new Date

    try {
        if (byTime === "Today") {
            let cDate = ("0" + (date.getDate())).slice(-2);
            let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
            let cYear = date.getFullYear();
            let currentDate = `${cMonth}-${cDate}-${cYear}`;
            filter.start = currentDate;
            console.log(filter)
            tasks.find(
                filter
            ).populate({
                path: "subfolderId",
                select: "subFolderName",

                populate: {
                    select: "folderName",
                    path: "folderId",
                    model: "taskfolder"
                }
            })
                .then((result) => {
                    res.send({ success: true, data: result })
                }).catch((err) => {
                    res.send(err)
                })
        } else if (byTime === "Tomorrow") {
            let cDate = ("0" + (date.getDate() + 1)).slice(-2);
            let cMonth = ("0" + (date.getMonth() + 1)).slice(-2);
            let cYear = date.getFullYear();
            let currentDate = `${cMonth}-${cDate}-${cYear}`;
            filter.start = currentDate;
            console.log(filter)
            tasks.find(
                filter
            ).populate({
                path: "subfolderId",
                select: "subFolderName",

                populate: {
                    select: "folderName",
                    path: "folderId",
                    model: "taskfolder"
                }
            })
                .then((result) => {
                    res.send({ success: true, data: result })
                }).catch((err) => {
                    res.send(err)
                })

        } else if (byTime === "This Week") {
            tasks.aggregate([
                {
                    $match: filter
                },
                {
                    $match: {
                        $expr: {
                            $eq: [
                                { $week: { $toDate: "$start" } }, { $week: "$$NOW" }
                            ]
                        }
                    }
                },

            ])
                .exec((err, memberdata) => {
                    if (err) {
                        res.send({
                            error: err,
                        });
                    } else {

                        res.send({ success: true, memberdata });


                    }
                })
        } else if (byTime === "This Month") {
            tasks.
                aggregate([
                    {
                        $match: filter

                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    { $month: { $toDate: "$start" } }, { $month: "$$NOW" }
                                ]
                            }
                        },
                    },
                ])
                .exec((err, memberdata) => {
                    if (err) {
                        res.send({
                            error: err,
                        });
                    } else {
                        if (err) {
                            res.send({
                                error: err,
                            });
                        } else {
                            res.send({ success: true, memberdata });
                        }
                    }
                })
        }
        else {
            tasks.find(
                filter
            ).populate({
                path: "subfolderId",
                select: "subFolderName",

                populate: {
                    select: "folderName",
                    path: "folderId",
                    model: "taskfolder"
                }
            })
                .then((result) => {
                    res.send({ success: true, data: result })
                }).catch((err) => {
                    res.send(err)
                })

        }
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
};