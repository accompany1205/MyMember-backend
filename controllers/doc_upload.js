const docfile = require("../models/doc_upload")
const docsubfolder = require("../models/doc_subfolder")
const { Storage } = require("@google-cloud/storage")
const sampleFile = require("../models/admin/upload_sample_file")
const std = require("../models/addmember")
const cloudUrl = require("../gcloud/imageUrl");

exports.docupload = async (req, res) => {
  let subFolderId = req.params.subFolderId;
  // let rootFolderId = req.params.rootFolderId;
  let userId = req.params.userId;
  let docData = req.body
  try {

    const docFileDetails = {
      document_name: docData.document_name,
      subFolderId: subFolderId,
      userId: userId
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
        docsubfolder.findByIdAndUpdate(req.params.subFolderId, { $push: { document: docdata._id } },
          function (err, updateDoc) {
            if (err) {
              res.send({ msg: 'File not added', success: false })
            }
            else {
              res.send({ msg: "Document Uploaded Successfully!", success: true })
            }
          })
      }
    });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })

  }
}

exports.updatedocupload = async (req, res) => {
  let docId = req.params.docId;
  let docData = req.body
  const new_SubfolderId = req.body.new_SubfolderId;
  const old_SubfolderId = req.body.old_SubfolderId;
  docData.subFolderId = new_SubfolderId
  console.log(docData)
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

    await docfile.updateOne({ _id: docId }, { $set: docData })
      .exec(async (err, docdata) => {
        if (err) {
          res.send({ msg: 'document is not added ' })
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
                res.send({
                  msg: "Document not updated",
                  success: false,
                });
              } else {
                res.send({
                  msg: "Document updated successfully",
                  success: true,
                });
              }
            });
        }
      });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false })

  }
}


exports.docremove = async (req, res) => {
  let docId = req.params.docId;
  try {
    await docfile.findOneAndRemove({ _id: docId },
      (err, data) => {
        if (err) {
          res.send({ msg: err, success: false })
        }
        else {
          docsubfolder.updateOne({ document: data._id }, { $pull: { document: data._id } },
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
