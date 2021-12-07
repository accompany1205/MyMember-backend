const class_schedule = require("../models/class_schedule");
const Prog = require("../models/program")
const dateRange = require('../Services/dateRange')
var moment = require("moment");
const { errorHandler } = require('../helpers/dbErrorHandler');
var mongo = require("mongoose")

exports.Create = async (req, res) => {
    var proDetail = await Prog.find({ programName: req.body.program_name })
    if (proDetail) {
        let reqBody = req.body
        let startDate = moment(reqBody.start_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let endDate = moment(reqBody.end_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
        let repeat_weekly_on = reqBody.repeat_weekly_on

        try {

            const dates = dateRange(startDate, endDate);

            let allAttendance = []
            for (let index in dates) {
                let date = moment(dates[index], 'MM/DD/YYYY').format('MM/DD/YYYY')
                let dayName = moment(new Date(date)).format('dddd').toLowerCase()
                if (repeat_weekly_on.includes(dayName)) {
                    let NewEvent = { ...reqBody, start_date: date, end_date: date, wholeSeriesEndDate: endDate, wholeSeriesStartDate: startDate }
                    // delete NewEvent['repeat_weekly_on']
                    allAttendance.push(NewEvent)
                }
            }
            await class_schedule.insertMany(allAttendance)
            res.send({ msg: 'Class schedule succefully!', success: true })
        } catch (error) {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })
        }
        // return
        // task.save((err, data) => {
        //     if (err) {
        //         res.send({ error: 'class schedule is not add', Error: err })
        //     }
        //     else {
        //         class_schedule.findByIdAndUpdate({ _id: data._id }, { $set: { userId: req.params.userId } })
        //             .exec((err, scheduleData) => {
        //                 if (err) {
        //                     res.send({ error: 'userId is not add in student' })
        //                 }
        //                 else {
        //                     res.send({ msg: 'class schedule is add successfully', data: scheduleData })
        //                 }
        //             })
        //     }
        // });
    } else {
        res.send({ msg: 'Somthing went wrong!', success: false })
    }
};

//checking 

exports.read = async (req, res) => {
    try {
        let result = await class_schedule.find({ userId: req.params.userId })
        res.send({ data: result, success: true })
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ""), success: false })
    }

    // const resp =
    //     class_schedule.find({ userId: req.params.userId })
    //         .then((result) => {
    //             res.json(result)
    //         }).catch((err) => {
    //             res.send(err)
    //         })
};

exports.class_schedule_Info = (req, res) => {
    try {
        const id = req.params.scheduleId
        const userId = req.params.userId
        var objId = mongo.Types.ObjectId(id)
        class_schedule.
            aggregate([
                { $match: { _id: objId } },
                {
                    $project: {
                        program_name: 1,
                        class_name: 1,
                        start_date: 1,
                        end_date: 1,
                        program_color: 1,
                        class_attendanceArray: 1,

                    }
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "class_attendanceArray.studentInfo",
                        foreignField: "_id",
                        as: "data"
                    }
                },
                {
                    $project: {
                        program_name: 1,
                        class_name: 1,
                        start_date: 1,
                        end_date: 1,
                        program_color: 1,
                        class_attendanceArray: 1,
                        "data.firstName": 1,
                        "data.lastName": 1,
                        "data.memberprofileImage": 1,
                        "data._id": 1
                    }
                },
                {
                    "$addFields": {
                        "attendence": {
                            "$map": {
                                "input": "$class_attendanceArray",
                                "in": {
                                    "$mergeObjects": [
                                        "$$this",
                                        {
                                            "$arrayElemAt": [
                                                "$data",
                                                { "$indexOfArray": ["$data._id", "$$this.studentInfo"] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $project: { data: 0, class_attendanceArray: 0 }
                }
            ])
            .exec((err, list) => {
                if (err) {
                    res.send({ error: "attendence list not found" });
                } else {

                    res.send({ data: list, success: true });

                }
            })
    }

    catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

};

exports.update = (req, res) => {
    const id = req.params.scheduleId;
    class_schedule.findByIdAndUpdate(id, { $set: req.body })
        .then((update_resp) => {

            res.status(200).send("class schedule has been updated successfully")
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};

exports.updateAll = async (req, res) => {

    // var proDetail = await Prog.find({ programName: req.body.program_name })
    // if (proDetail) {
    let reqBody = req.body
    let startDate = moment(reqBody.start_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
    let endDate = moment(reqBody.end_date, 'MM/DD/YYYY').format('MM/DD/YYYY')
    let repeat_weekly_on = reqBody.repeat_weekly_on


    const dates = dateRange(startDate, endDate);

    let allAttendance = []
    for (let index in dates) {
        let date = moment(dates[index], 'MM/DD/YYYY').format('MM/DD/YYYY')
        let dayName = moment(new Date(date)).format('dddd').toLowerCase()
        if (repeat_weekly_on.includes(dayName)) {
            let NewEvent = { ...reqBody, start_date: date, end_date: date, wholeSeriesEndDate: endDate, wholeSeriesStartDate: startDate }
            // delete NewEvent['repeat_weekly_on']
            allAttendance.push(NewEvent)
        }
    }

    const data = await class_schedule.deleteMany({
        $and:
            [{ userId: req.params.userId },
            { program_name: req.body.defaultprogram_name },
            { class_name: req.body.defaultclass_name }]
    })



        // await class_schedule.aggregate([
        //     {
        //         $project: {
        //             item: {
        //                 replaceAll: {
        //                     input: "$item",
        //                     find: {
        //                         $and:
        //                             [{ userId: req.params.userId },
        //                             { program_name: req.body.program_name },
        //                             { class_name: req.body.class_name }]
        //                     },
        //                     replacement: allAttendance
        //                 }
        //             }
        //         }
        //     }
        // ])
        .then(async (update_resp) => {
            if (update_resp.nModified < 1) {
                res.status(403).json({
                    message: 'class_name/program_name not found',
                    success: false
                })
            }
            else {
                const res1 = await class_schedule.insertMany(allAttendance);
                res.status(200).json({
                    message: 'All class schedule has been updated Successfully',
                    success: true
                })
            }
            // else {
            //     const res1 = await class_schedule.insertMany({ $and:[{ userId: req.params.userId },allAttendance]});
            //     res.status(200).json({
            //         message: 'All class schedule has been updated Successfully',
            //         success: true
            //     })
            // }
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })
        })
}


exports.remove = (req, res) => {
    const id = req.params.scheduleId
    class_schedule.deleteOne({ _id: id })
        .then((resp) => {
            res.json({ msg: "class schedule has been deleted successfully", success: true })
        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};


exports.removeAll = (req, res) => {
    // const id = req.params.scheduleId
    class_schedule.deleteMany(
        {
            $and: [{ userId: req.params.userId },
            { program_name: req.body.program_name },
            { class_name: req.body.class_name }]
        }
    )
        .then((resp) => {
            if (resp.deletedCount < 1) {
                res.status(403).json({
                    message: 'class_name/program_name not found',
                    success: false
                })
            }
            else {
                res.status(200).json({
                    message: 'All class schedule has been deleted Successfully',
                    success: true

                })

            }

        }).catch((error) => {
            res.send({ error: error.message.replace(/\"/g, ""), success: false })

        })
};