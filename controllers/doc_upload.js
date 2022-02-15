const docfile = require("../models/doc_upload")
const docsubfolder = require("../models/doc_subfolder")
const docfolder = require("../models/doc_folder")
const { Storage } = require("@google-cloud/storage")
const sampleFile = require("../models/admin/upload_sample_file")
const std = require("../models/addmember")
const cloudUrl = require("../gcloud/imageUrl");

exports.docupload = async (req, res) => {
  let subFolderId = req.params.subFolderId;
  let rootFolderId = req.params.FolderId;
  let userId = req.params.userId;
  let adminId = req.params.adminId;
  let docData = req.body
  try {

    const docFileDetails = {
      document_name: docData.document_name,
      rootFolderId: rootFolderId,
      subFolderId: subFolderId,
      userId: userId,
      adminId: adminId
    }
    if (req.file) {
      await cloudUrl
        .imageUrl(req.file)
        .then(data => {
          docFileDetails.document = data
        })
        .catch(err => {
          res.send({ msg: "Document not uploaded!", success: false })
        })
    }
    var mydoc = new docfile(docFileDetails);
    mydoc.save((err, docdata) => {
      if (err) {
        res.send({ msg: 'document is not added', success: false })
      }
      else {
        if (!(JSON.parse(subFolderId))) {
          docfolder.findByIdAndUpdate(rootFolderId, { $push: { document: docdata._id } },
            function (err, updateDoc) {
              if (err) {
                return res.send({ msg: 'File not added', success: err })
              }
              else {

                return res.send({ msg: "Document Uploaded Successfully!", success: updateDoc })
              }
            })
        }
        else {
          docsubfolder.findByIdAndUpdate(subFolderId, { $push: { document: docdata._id } },
            function (err, updateDoc) {
              if (err) {
                return res.send({ msg: 'File not added', success: err })
              }
              else {
                return res.send({ msg: "Document Uploaded Successfully!", success: true })
              }
            })
        }
      }
    });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })

  }
}

exports.updatedocupload = async (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  let docId = req.params.docId;
  let docData = req.body
  const new_SubfolderId = req.body.new_SubfolderId;
  const old_SubfolderId = req.body.old_SubfolderId;
  const new_FolderId = req.body.new_FolderId;
  const old_FolderId = req.body.old_FolderId;
  docData.subFolderId = new_SubfolderId
  docData.rootFolderId = new_FolderId
  try {
    if (req.file) {
      await cloudUrl
        .imageUrl(req.file)
        .then(data => {
          docData.document = data
        })
        .catch(err => {
          res.send({ msg: "Document not uploaded!", success: false })
        })
    }

    await docfile.updateOne({ _id: docId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: docData })
      .exec(async (err, docdata) => {
        if (err) {
          res.send({ msg: 'document is not added ' })
        }
        else {
          if (!new_SubfolderId) {

            await docfolder.findByIdAndUpdate(new_FolderId, {
              $addToSet: { document: docId },
            });
            await docfolder
              .findByIdAndUpdate(old_FolderId, {
                $pull: { document: docId },
              })
              .exec((err, temp) => {
                if (err) {
                  return res.send({
                    msg: "Document not updated",
                    success: false,
                  });
                } else {
                  return res.send({
                    msg: "Document updated successfully",
                    success: true,
                  });
                }
              });
          }
          else {
            await docsubfolder.findByIdAndUpdate(new_SubfolderId, {
              $addToSet: { document: docId },
            });
            await docsubfolder
              .findByIdAndUpdate(old_SubfolderId, {
                $pull: { document: docId },
              })
              .exec((err, temp) => {
                if (err) {
                  return res.send({
                    msg: "Document not updated",
                    success: false,
                  });
                } else {
                  return res.send({
                    msg: "Document updated successfully",
                    success: true,
                  });
                }
              });
          }
        }
      });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })

  }
}


exports.docremove = async (req, res) => {
  let docId = req.params.docId;
  let isFolder = req.query.isFolder || false
  const adminId = req.params.adminId
  const userId = req.params.userId;
  try {
    await docfile.findOneAndRemove({ _id: docId, $and: [{ userId: userId }, { adminId: adminId }] },
      (err, data) => {
        if (err) {
          res.send({ msg: err, success: false })
        }
        else {
          if (data) {
            if (JSON.parse(isFolder)) {
              docfolder.updateOne({ document: docId }, { $pull: { document: docId } },
                function (err, temp) {
                  if (err) {
                    res.send({
                      msg: "Document not removed",
                      success: false,
                    });
                  } else {
                    res.send({
                      msg: "Document removed successfully",
                      success: true,
                    });
                  }
                })

            } else {
              docsubfolder.updateOne({ document: docId }, { $pull: { document: docId } },
                function (err, temp) {
                  if (err) {
                    res.send({
                      msg: "Document not removed",
                      success: false,
                    });
                  } else {
                    res.send({
                      msg: "Document removed successfully",
                      success: true,
                    });
                  }
                })
            }
          }
          else {
            res.send({
              msg: 'document removed already!', success: true
            })
          }
        }

      })
  }

  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })

  }

}

exports.file_sample = (req, res) => {
  sampleFile.findOne()
    .select('sample_file')
    .exec((err, doc_sample) => {
      if (err) {
        res.send(err)
      }
      else {
        res.send(doc_sample)
      }
    })
}

exports.groupList = (req, res) => {
  std.aggregate([
    { $match: { $and: [{ userId: req.params.userId }] } },
    {
      $group: {
        _id: "$studentType",
        list: {
          $push: {
            firstName: "$firstName",
            lastName: "$lastName",
            primaryPhone: "$primaryPhone",
            email: "$email",
            studentBeltSize: "$studentBeltSize",
            program: "$program",
            age: "$age"
          }
        },

      }
    },
  ]).exec((err, sList) => {
    if (err) {
      res.send(err)
    }
    else {
      var d = sList
      std.aggregate([
        { $match: { $and: [{ userId: req.params.userId }] } },
        {
          $group: {
            _id: "$leadsTracking",
            list: {
              $push: {
                firstName: "$firstName",
                lastName: "$lastName",
                primaryPhone: "$primaryPhone",
                email: "$email",
                studentBeltSize: "$studentBeltSize",
                program: "$program",
                age: "$age"
              }
            },

          }
        }
      ]).exec((err, resp) => {
        for (row of resp) {
          d.push(row)
        }
        res.send(d)
      })
    }
  })
}
