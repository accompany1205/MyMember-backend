const templateFolder = require("../models/text_template_folder");
const templateSubFolder = require("../models/text_template_subfolder");
const UploadFiles = require("../models/text_template_upload");

//folder
exports.createfolder = async (req, res) => {
  try {
    let userId = req.params.userId;
    let adminId = req.params.adminId;
    let folderObj = new templateFolder({
      folderName: req.body.folderName,
      userId: userId,
      adminId: adminId
    });
    folderObj.save((err, folder) => {
      if (err) {
        res.send({ msg: "Folder name already exist!", success: false });
      } else {
        res.send({
          msg: "Folder created successfully",
          success: true,
        });
      }
    });
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

exports.readfolder = (req, res) => {
  templateFolder.find({ $or: [{ userId: req.params.userId }, { adminId: { $exists: true } }] })
    .populate({
      path: 'subFolder',
      populate: {
        path: 'template',
        model: 'templateUpload',
      }
    }).exec((err, folderList) => {
      if (err) {
        res.send({ error: 'template folder is not find' })
        console.log(err)
      }
      else {
        res.send(folderList)
      }
    })
}
exports.getadminFolders = async (req, res) => {
  const adminId = req.params.adminId;
  await templateFolder
    .find({ adminId: adminId })
    .populate({
      path: 'subFolder',
      populate: {
        path: 'template',
        model: 'templateUpload',
      },

      // .populate('template')
    })
    .exec((err, folder) => {
      if (err) {
        res.send({ msg: "template folder is  found", success: false });
      } else {
        res.send({
          data: folder,
          success: true,
        });
      }
    });
};

exports.editFolder = async (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  const folderId = req.params.docfolderId;

  try {
    await templateFolder
      .updateOne({ _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
      .exec((err, updateFolder) => {
        if (err) {
          res.send({ msg: 'Folder not updated!', success: false })
        }
        else {
          // if (updateFolder.n < 1) {
          //   return res.send({
          //     msg: "This is system generated folder Only admin can update",
          //     success: false,
          //   });
          // }
          res.send({ msg: 'Folder update successfully', success: true })
        }
      })
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

exports.removeFolder = (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  const folderId = req.params.docfolderId
  templateFolder.
    findOneAndRemove(
      { _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] },
      async (err, removeFolder) => {
        console.log(removeFolder)
        if (err) {
          res.send({ success: false, msg: 'Document folder not removed' })
        }
        else {
          await templateSubFolder.deleteMany({ folderId: folderId })
            .exec((err, delFolder) => {
              if (err) {
                res.send({ msg: "Folder is not remove", success: false });
              } else {
                res.send({
                  msg: "Folder removed successfully",
                  success: true,
                })
              }
            })
        }
      })
}

exports.templateList = (req, res) => {
  UploadFiles.find({ subFolderId: req.params.subfolderId })
    .populate('uploadTemplates')
    .exec((err, doclist) => {
      if (err) {
        res.send({ msg: 'template list not found', success: false })
      }
      else {
        res.send(doclist)
      }
    })
}

//subFolder
exports.createSubFolder = (req, res) => {
  let userId = req.params.userId;
  let adminId = req.params.adminId;
  let folderId = req.params.folderId;
  var docSub = new templateSubFolder({
    subFolderName: req.body.subFolderName,
    userId: userId,
    adminId: adminId,
    folderId: folderId
  })
  docSub.save((err, subfolder) => {
    if (err) {
      res.send({ msg: 'subfolder is not created', success: err })
    }
    else {
      templateFolder.updateOne({ _id: req.params.folderId }, { $push: { subFolder: subfolder._id } })
        .exec((err, updteFolder) => {
          if (err) {
            res.send({ msg: 'subfolder is not add in folder', success: false })
          }
          else {
            res.send({ 'msg': 'subfolder create successfully', success: true })
          }
        })
    }
  })
}

exports.editSubFolder = (req, res) => {
  const folderId = req.params.subfolderId;
  const adminId = req.params.adminId;
  const userId = req.params.userId;
  try {
    templateSubFolder
      .updateOne({ _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] }, { $set: req.body })
      .exec((err, updatsubFolder) => {
        if (err) {
          res.send({ msg: 'subFolder not updated!', success: err })
        }
        else {
          res.send({ msg: "subFolder updated Successfully", success: true })
        }
      })
  }
  catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ""), success: false });
  }
}

exports.removeSubFolder = (req, res) => {
  const adminId = req.params.adminId
  const userId = req.params.userId;
  let folderId = req.params.subfolderId
  templateSubFolder.findOneAndRemove(
    { _id: folderId, $and: [{ userId: userId }, { adminId: adminId }] })
    .exec((err, removeFolder) => {
      if (err) {
        res.send({ msg: 'sub folder is not remove', success: err })
      }
      else {
        templateFolder.updateOne({ "subFolder": folderId }, { $pull: { "subFolder": folderId } },
          function (err, data) {
            if (err) {
              res.send({ msg: 'subfolder is not remove from folder', success: false })
            }
            else {
              res.send({
                msg: 'subfolder removed successfully', success: true
              })
            }
          })

      }
    })
}

//Templates
exports.removeTemplate = (req, res) => {
  UploadFiles.findByIdAndRemove(req.params.templateId)
    .exec((err, removeFolder) => {
      if (err) {
        res.send({ error: 'template is not remove' });
      }
      else {
        res.send({ msg: 'template is remove in folder' });
      }
    })
}


exports.templateUpload = (req, res) => {
  let userId = req.params.userId;
  let adminId = req.params.adminId;
  const subFolderId = req.params.subFolderId;
  const rootFolderId = req.params.rootFolderId;
  const docFileDetails = {
    template_name: req.body.template_name,
    text: req.body.text,
    subFolderId: subFolderId,
    rootFolderId: rootFolderId,
    userId: userId,
    adminId: adminId
  }
  var mydoc = new UploadFiles(docFileDetails);
  mydoc.save((err, docdata) => {
    if (err) {
      res.send({ msg: 'template is not added', success: false })
    }
    else {
      templateSubFolder.updateOne({ _id: subFolderId }, { $push: { template: docdata._id } })
        .exec((err, updteFolder) => {
          if (err) {
            res.send({ msg: 'Template not added in Folder', success: false })
          }
          else {
            res.send({ 'msg': 'Template created successfully', success: true })
          }
        })
    }
  });
}

exports.editTemplate = (req, res) => {
  UploadFiles.updateOne({ _id: req.params.templateId }, req.body)
    .exec((err, updateTemplate) => {
      if (err) {
        res.send({ msg: 'sub folder is not update' })
      }
      else {
        res.send({ msg: 'Template updated successfully', success: false })
      }
    })
}

exports.templateRemove = (req, res) => {
  const templateId = req.params.templateId;
  UploadFiles.findOneAndRemove({ _id: templateId },
    function (err, updateDoc) {
      if (err) {
        res.send({ msg: 'Template not removed', success: false })
      }
      else {
        templateSubFolder.updateOne({ template: templateId },
          { $pull: { template: templateId } },
          function (err, temp) {
            if (err) {
              res.send({
                msg: "Template not removed",
                success: false,
              });
            }
            else {
              res.send({
                msg: "Template removed successfully",
                success: true,
              })
            }

          })
      }
    })

}
