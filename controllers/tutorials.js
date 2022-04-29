const tutorialModal = require('../models/tutorials');
const tutorialSubFolder = require('../models/tut_subfolder');

exports.create = async (req, res) => {
    try {
        const tutorialDetails = await req.body;
        tutorialDetails.userId = req.params.userId;
        tutorialDetails.adminId = req.params.adminId;
        tutorialDetails.subfolderId = req.params.subfolderId;
        const tutorialObj = new tutorialModal(tutorialDetails);
        await tutorialObj.save((err, data) => {
            if (err) {
                res.send({ msg: 'url already exists!', success: err });
            } else {
                tutorialSubFolder.findByIdAndUpdate(
                    req.params.subfolderId,
                    {
                        $push: { tutorial: data._id },
                    },
                    (err, data) => {
                        if (err) {
                            res.send({
                                msg: 'tutorial not added in folder',
                                success: false,
                            });
                        } else {
                            res.send({
                                msg: 'tutorial created successfully',
                                success: true,
                            });
                        }
                    }
                );
            }
        });
    } catch (error) {
        res.send({ error: error.message.replace(/\"/g, ''), success: false });
    }
};

exports.read = (req, res) => {
    const userId = req.params.userId;
    const adminId = req.params.adminId;
    tutorialModal
        .find({ $and: [{ userId: { $in: [userId] } }, { adminId: adminId }] })
        .exec((err, data) => {
            if (err) {
                res.send({ error: 'tutorial list is not find' });
            } else {
                res.send({ data, success: true });
            }
        });
};

exports.tutorialInfo = (req, res) => {
    var tutorialId = req.params.tutorialId;
    tutorialModal.findById(tutorialId).exec((err, data) => {
        if (err) {
            res.send({ msg: 'tutorial  not found', success: false });
        } else {
            res.send({ data, success: true });
        }
    });
};

exports.remove = (req, res) => {
    const tutorialId = req.params.tutorialId;
    const adminId = req.params.adminId;
    const userId = req.params.userId;
    try {
        tutorialModal.findOneAndRemove(
            { _id: tutorialId, $and: [{ userId: userId }, { adminId: adminId }] },
            (err, data) => {
                if (err) {
                    res.send({ msg: 'tutorial is not delete', success: false });
                } else {
                    if (!data) {
                        return res.send({
                            msg: 'This is system generated tutorial Only admin can delete',
                            success: false,
                        });
                    }
                    tutorialSubFolder.updateOne(
                        { tutorial: data._id },
                        { $pull: { tutorial: data._id } },
                        function (err, temp) {
                            if (err) {
                                res.send({
                                    msg: 'tutorial not removed',
                                    success: false,
                                });
                            } else {
                                res.send({
                                    msg: 'tutorial removed successfully',
                                    success: true,
                                });
                            }
                        }
                    );
                }
            }
        );
    } catch (er) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false });
    }
};

exports.tutorialUpdate = async (req, res) => {
    try {
        var tutorialData = req.body;
        const tutorialId = req.params.tutorialId;
        const adminId = req.params.adminId;
        const userId = req.params.userId;
        const new_folderId = req.body.folderId;
        const old_folderId = req.body.old_folderId;
        tutorialData.folderId = new_folderId;
        //const promises = [];
        tutorialModal
            .updateOne(
                { _id: tutorialId, $and: [{ userId: userId }, { adminId: adminId }] },
                { $set: tutorialData }
            )

            .exec(async (err, data) => {
                if (err) {
                    res.send({
                        msg: err,
                        success: false,
                    });
                } else {
                    if (data.n < 1) {
                        return res.send({
                            msg: 'This is system generated tutorial Only admin can update',
                            success: false,
                        });
                    }
                    await tutorialSubFolder.findByIdAndUpdate(new_folderId, {
                        $addToSet: { tutorial: tutorialId },
                    });
                    await tutorialSubFolder
                        .findByIdAndUpdate(old_folderId, {
                            $pull: { tutorial: tutorialId },
                        })
                        .exec((err, temp) => {
                            if (err) {
                                res.send({
                                    msg: 'tutorial not updated',
                                    success: false,
                                });
                            } else {
                                res.send({
                                    msg: 'tutorial updated successfully',
                                    success: true,
                                });
                            }
                        });
                }
            });
    } catch (err) {
        res.send({ msg: err.message.replace(/\"/g, ''), success: false });
    }
};

