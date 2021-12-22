const smartlist = require('../models/smartlists')
const member = require('../models/addmember')

exports.get_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }

        let sl_data = await smartlist.find({ userId: userId })
        res.send({ data: sl_data, success: true });
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });
    }
}
exports.create_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId) {
            res.json({
                success: false,
                msg: "Please give the userId  in params!"
            })
        }
        let promises = [];
        let { leads, activetrial, formertrial, activestudent, formerstudent, status, programName, current_rank_name, age, zipPostalCode, location } = req.body

        const getFilter = (query, fields) => fields.reduce(
            (filter, field) => query[field] !== undefined ? {
                [field]: query[field],
                ...filter,
            } : filter, {}
        );

        const query = {
            status: status,
            program: programName,
            current_rank_name: current_rank_name,
            age: age,
            location: location,
            zipPostalCode: zipPostalCode
        }
        const fields = ['status', 'program', 'current_rank_name', "age", "location", "zipPostalCode"];
        let filter = getFilter(query, fields)

        if (req.body.leads) {
            let leadData = await member.find({
                studentType: leads,
                userId: userId,
                ...filter
            }
                , { email: 1 })
            promises = [...leadData];
        }
        if (req.body.activetrial) {
            let activeTData = await member.find({
                studentType: activetrial,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...activeTData, ...promises]
        }
        if (req.body.formertrial) {
            let formerTData = await member.find({
                studentType: formertrial,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...formerTData, ...promises]

        }
        if (req.body.activestudent) {
            let activeSData = await member.find({
                studentType: activestudent,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...activeSData, ...promises]

        }
        if (req.body.formerstudent) {
            let formerSData = await member.find({
                studentType: formerstudent,
                userId: userId,
                ...filter
            },
                { email: 1 })
            promises = [...formerSData, ...promises]

        }
        await Promise.all(promises);
        console.log(promises.length)
        const map = {};
        const newArray = [];
        promises.forEach(el => {
            if (!map[JSON.stringify(el)]) {
                map[JSON.stringify(el)] = true;
                newArray.push(el);
            }
        });

        let sldata = smartlist({
            smartlistname: req.body.smartlistname,
            smartlists: newArray,
            userId: userId
        })

        sldata.save((err, sldata) => {
            if (err) {
                res.send({ error: err.message.replace(/\"/g, ""), success: false });

            } else {
                return res.send({ msg: sldata, success: true });

            }
        })




    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }
}

exports.update_smart_list = async (req, res) => {
    try {
        let userId = req.params.userId
        let slId = req.params.slId
        if (!slId) {
            res.json({
                success: false,
                msg: "Please give the leadsId  in params!"
            })
        }
        let promises = [];
        let { leads, activetrial, formertrial, activestudent, formerstudent, status, programName, current_rank_name, age, zipPostalCode, location } = req.body
        const getFilter = (query, fields) => fields.reduce(
            (filter, field) => query[field] !== undefined ? {
                [field]: query[field],
                ...filter,
            } : filter, {}
        );

        const query = {
            status: status,
            program: programName,
            current_rank_name: current_rank_name,
            age: age,
            location: location,
            zipPostalCode: zipPostalCode
        }
        const fields = ['status', 'program', 'current_rank_name', "age", "location", "zipPostalCode"];
        let filter = getFilter(query, fields)

        if (req.body.leads) {
            let leadData = await member.find({
                studentType: leads,
                userId: userId,
                ...filter
            }
                , { email: 1 })
            promises = [...leadData];
        }
        if (req.body.activetrial) {
            let activeTData = await member.find({
                studentType: activetrial,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...activeTData, ...promises]
        }
        if (req.body.formertrial) {
            let formerTData = await member.find({
                studentType: formertrial,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...formerTData, ...promises]

        }
        if (req.body.activestudent) {
            let activeSData = await member.find({
                studentType: activestudent,
                userId: userId,
                ...filter
            }, { email: 1 })
            promises = [...activeSData, ...promises]

        }
        if (req.body.formerstudent) {
            let formerSData = await member.find({
                studentType: formerstudent,
                userId: userId,
                ...filter
            },
                { email: 1 })
            promises = [...formerSData, ...promises]

        }

        await Promise.all(promises);
        const map = {};
        const newArray = [];
        promises.forEach(el => {
            if (!map[JSON.stringify(el)]) {
                map[JSON.stringify(el)] = true;
                newArray.push(el);
            }
        });
        await smartlist.findByIdAndUpdate(slId, {
            smartlistname: req.body.smartlistname,
            smartlists: newArray
        },
            ((err, leads_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "smartlist updated successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

exports.delete_smart_list = async (req, res) => {
    try {
        let slId = req.params.slId
        if (!slId) {
            res.json({
                success: false,
                msg: "Please give the leadsId  in params!"
            })
        }
        await smartlist.findByIdAndRemove(slId, req.body,
            ((err, leads_data) => {
                if (err) {
                    res.send({ error: err.message.replace(/\"/g, ""), success: false });

                } else {
                    return res.send({ msg: "smartlist deleted successfully", success: true });
                }
            }))
    } catch (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false });

    }

}

