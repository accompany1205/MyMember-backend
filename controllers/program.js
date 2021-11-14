const program = require("../models/program");


exports.create = async (req, res) => {
    const Id = req.params.userId;
    const programName = req.body.programName;
    console.log("---",programName )
    const programeName = await program.find({$and: [
        { $or: [ { userId: Id } ] },
        { $or: [ { programName: programName } ] }
    ]})
    console.log("---",programeName)
    if(!programeName[0]){
        var prog = new program({
            "programName":req.body.programName,
            "color":req.body.color,
            "lable":req.body.lable,
            "total_rank":req.body.total_rank,
            "progression":req.body.progression,
            "type":req.body.type,
            "requirement":req.body.requirement
        })
        prog.save((err, data) => {
            if (err) {
                res.send({ error: 'program is not create' })
            }
            else {
                if (req.file) {
                    const cloudenary = require("cloudinary").v2
                    cloudenary.config({
                        cloud_name: process.env.cloud_name,
                        api_key: process.env.cloud_api_key,
                        api_secret: process.env.cloud_api_secret
                    });
    
                    var filename = req.file.originalname;
                    var path = req.file.path;
                    var uniquefilename = filename + (Date.now())
    
                    cloudenary.uploader.upload(
                        path,
                        { public_id: `program/${uniquefilename}`, tags: `program` }, // directory and tags are optional
                        function (err, image) {
                            if (err) return res.send(err)
                            const fs = require('fs')
                            fs.unlinkSync(path)
                            program.findByIdAndUpdate({ _id: data._id }, { $set: { program_image: image.url, userId: Id } })
                                .then((response) => {
                                    res.send(response)
                                }).catch((error) => {
                                    res.send({msg:"image not add in program", error})
                                });
                        }
                    );
                } else {
                    program.findByIdAndUpdate({ _id: data._id }, { $set: { userId: Id } })
                        .exec((err, programData) => {
                            if (err) {
                                res.send({ error: 'user id is not add in program' })
                            }
                            else {
                                res.send({msg:'Program updated successfully ',programData:programData})
                            }
                        })
                }
            }
        });
    }else {
        res.json({
            msg:"Program Alredy exist for the school",
            success:false
        })
    }
    
};

exports.read = (req, res) => {
    program.find({ $or: [{ status: 'Admin' },{ userId: req.params.userId }] })
        .populate({
            path: 'program_category',
            populate: {
                path: 'program_subcategory',
                model: 'psubcategory'
            }
        })
        .populate('program_rank')
        .exec((err, programdata) => {
            if (err) {
                res.send({ error: 'program is not found' })
            }
            else {
                res.send(programdata)
            }
        })

};

exports.programs_detail = (req, res) => {
    var id = req.params.proId
    program.findById(id)
        .populate('program_category')
        .populate('program_rank')
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'category is not populate' })
            }
            else {
                res.send(data)
            }
        })
};

exports.program_rank = (req, res) => {
    var id = req.params.proId
    program.findById(id)
        .select('programName')
        .populate('program_rank')
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'rank is not populate' })
            }
            else {
                res.send(data)
            }
        })
};

exports.update = (req, res) => {
    const uid = req.params.proId;
    program.updateOne({ _id: uid }, req.body)
        .then((result) => {
            if (req.file) {
                const cloudenary = require("cloudinary").v2
                cloudenary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.cloud_api_key,
                    api_secret: process.env.cloud_api_secret
                });
                var filename = req.file.originalname;
                var path = req.file.path;
                var uniquefilename = filename + (Date.now())

                cloudenary.uploader.upload(
                    path,
                    { public_id: `program/${uniquefilename}`, tags: `program` }, // directory and tags are optional
                    function (err, image) {
                        if (err) return res.send(err)
                        const fs = require('fs')
                        fs.unlinkSync(path)

                        program.findByIdAndUpdate(uid, { $set: { program_image: image.url } })
                            .then((response) => {
                                res.json(response)
                            });
                    }
                );
            } else {
                res.send({msg: "programm updated succesfully",success:true});
    
            }
        }).catch((err) => {
            res.send({message:err.message.replace(/\"/g, ""),success:false} );
        })
}


exports.remove = (req, res) => {
    const uid = req.params.proId;
    program.remove({ _id: uid })
        .then((resp) => {
            res.json({ data: resp, message: "program deleted succesfuly" });
        }).catch((err) => {
            res.send(err)
        })
};




