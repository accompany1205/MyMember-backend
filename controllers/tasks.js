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

exports.taskFilter = async (req, res) => {
    const userId = req.params.userId;


    const { filter, byTime } = req.body;
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

            // const totalCount = await tasks.find({
            //     $and: [
            //         { userId: userId },
            //         { start: currentDate }
            //     ]
            // }).countDocuments();
            // $and: [
            //     filter,
            //     { start: currentDate }
            // ]
            taskFolder.find({
                subFolder: { $ne: [] }
            })
                .populate({
                    path: 'subFolder',
                    populate: {
                        path: 'tasks',
                        model: 'Task',
                        match: filter
                    },
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
            taskFolder.find({
                subFolder: { $ne: [] }
            })
                .populate({
                    path: 'subFolder',
                    populate: {
                        path: 'tasks',
                        model: 'Task',
                        match: filter
                    },
                })
                .then((result) => {
                    res.send({ success: true, data: result })
                }).catch((err) => {
                    res.send(err)
                })

        } else if (byTime === "This Week") {
            taskFolder
                .aggregate([
                    {
                        $match: {
                            userId: userId
                        }
                    },
                    {
                        $lookup: {
                            from: "tasksubfolders",
                            localField: "subFolder",
                            foreignField: "_id",
                            as: "subFolder"
                        }
                    },
                    // {
                    //     $unwind: {
                    //         path: "$subFolder",
                    //         preserveNullAndEmptyArrays: true
                    //     }
                    // },
                    {
                        $lookup: {
                            from: "tasks",
                            localField: "subFolder.tasks",
                            foreignField: "_id",
                            as: "subFolder.taskss"
                        }
                    },

                    // {
                    //     $match: {
                    //         $expr:
                    //             { $eq: [{ $week: '$date' }, { $week: "$$NOW" }] }
                    //     }
                    // },

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
                        $match: {
                            category: catType,
                            userId: userId
                        }
                    },
                    {
                        $project: {
                            status: 1,
                            repeatedDates: 1,
                            groupInfoList: 1,
                            studentInfo: 1,
                            end_time: 1,
                            start_time: 1,
                            app_color: 1,
                            end: 1,
                            repeatedConcurrence: 1,
                            interval: 1,
                            range: 1,
                            appointment_type: 1,
                            title: 1,
                            category: 1,
                            notes: 1,
                            start: 1,
                            date: {
                                "$dateFromString": {
                                    "dateString": "$start",
                                    "format": "%m-%d-%Y"
                                }
                            }

                        },
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $month: "$date",
                                    },
                                    {
                                        $month: "$$NOW",
                                    },
                                ]
                            }
                        },
                    },
                    {
                        $facet: {
                            paginatedResults: [{ $skip: pagination.skip }, { $limit: pagination.limit }],
                            totalCount: [
                                {
                                    $count: 'count'
                                }
                            ]
                        }
                    }
                ])
                .exec((err, memberdata) => {
                    if (err) {
                        res.send({
                            error: err,
                        });
                    } else {
                        let data = memberdata[0].paginatedResults
                        if (data.length > 0) {
                            res.send({ data: data, totalCount: memberdata[0].totalCount[0].count, success: true });

                        } else {
                            res.send({ msg: 'data not found', success: false });
                        }
                    }
                })
        }
    }
    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })
    }
};