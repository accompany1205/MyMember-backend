const docfile = require("../models/doc_upload")
const docsubfolder = require("../models/doc_subfolder")
const docfolder = require("../models/doc_folder")
const { Storage } = require("@google-cloud/storage")
const sampleFile = require("../models/admin/upload_sample_file")
const std = require("../models/addmember")
const cloudUrl = require("../gcloud/imageUrl");

exports.docupload = async (req, res) => {
  let { rootFolderId, subFolderId, userId, adminId } = req.params;
  let docData = req.body;
  try {
    const allDocFileDetails = [];
    if (req.files) {
      for(const file of req.files) {
        const docFileDetails = {
          rootFolderId: rootFolderId,
          subFolderId: subFolderId,
          userId: userId,
          adminId: adminId
        }
        try {
          const data = await cloudUrl.imageUrl(file);
          docFileDetails.document_name = docData.document_name || Math.random().toString(36).substring(5);
          docFileDetails.document = data;
          allDocFileDetails.push(docFileDetails)
        } catch(err) {
          res.send({ msg: "Document not uploaded!", success: false })
        }
      }
    }

    docfile.insertMany(allDocFileDetails).then((docdata) => {
      let ids = docdata.map((d) => {
        return d._id;
      });
      if(
        subFolderId !== undefined &&
        subFolderId !== null &&
        subFolderId !== ':subFolderId'
        ) {
        docsubfolder.findByIdAndUpdate(subFolderId, { $push: { document: ids } })
        .then((updateDoc) => {
          return res.send({ msg: "Document Uploaded Successfully in Sub Folder!", success: true })
        })
        .catch((err) => {
          return res.send({ msg: 'File not added', success: err })
        })
      } else {
        docfolder.findByIdAndUpdate(rootFolderId, { $push: { document: ids } })
        .then((updateDoc) => {
          return res.send({ msg: "Document Uploaded Successfully in Root Folder!", success: updateDoc })
        })
        .catch((err) => {
          return res.send({ msg: 'File not added', success: err })
        })
      }
    }).catch((err) => {
      res.send({ msg: 'document is not added', success: err })
    })
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
          res.send({ msg: 'document is not added', success: err })
        }
        else {
          if (docdata.nModified < 1) {
            return res.send({
              msg: 'This is system generated document Only admin can update',
              success: false,
            });
          }

          if (!new_SubfolderId) {
            await docfolder
              .findByIdAndUpdate(old_FolderId, {
                $pull: { document: docId },
              });
            await docfolder.findByIdAndUpdate(new_FolderId, {
              $addToSet: { document: docId },
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
            await docsubfolder
              .findByIdAndUpdate(old_SubfolderId, {
                $pull: { document: docId },
              });
            await docsubfolder.findByIdAndUpdate(new_SubfolderId, {
              $addToSet: { document: docId },
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
  let isFolder = req.query.isFolder == true ? true : false
  const adminId = req.params.adminId
  const userId = req.params.userId;
  try {
    await docfile.findOneAndRemove({ _id: docId, $and: [{ userId: userId }, { adminId: adminId }] },
      (err, data) => {
        if (err) {
          res.send({ msg: err, success: false })
        }
        else {
          // if (!data) {
          //   return res.send({
          //     msg: 'This is system generated Documents Only admin can delete',
          //     success: false,
          //   });
          // }
          // else {
          if (isFolder) {
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
