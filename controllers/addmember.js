const {
  functions,
  add
} = require("lodash");
var addmemberModal = require("../models/addmember");
const cloudUrl = require("../gcloud/imageUrl");
const program = require("../models/program");
const rank_change = require("../models/change_rank");
const change_rank = require("../models/change_rank");
const sentEmail = require("../models/emailSentSave");
const sgmail = require("sendgrid-v3-node");
const User = require("../models/user");
const membershipModal = require('../models/membership')

// const ManyStudents = require('../std.js');
// const students = require('../std.js');

// exports.next_std_find =(req,res)=>{
//     addmemberModal.find({_id:{$lt:req.params.stdId}},{upsert:true})
//     .sort({_id:-1})
//     .limit(1)
//     .exec((err,data)=>{
//         if(err){
//             res.send(err)
//         }
//         else{
//         }
//     })
// }

exports.getStudentsByProgramm = async (req, res) => {
  let userId = req.params.userId;
  let program = req.params.program;
  if (!userid || !program) {
    res.json({
      status: false,
      msg: "Please give userId and program into params!!"
    })
  }
  let filter = {
    "userId": userId,
    "program": program
  }
  let studentsByProgram = await addmemberModel.find(filter);
  if (!studentsByProgram) {
    res.json({
      status: false,
      msg: "Having error while fetching data!!"
    })
  } else {
    res.json({
      status: false,
      msg: "Please find the data",
      data: studentByProgram
    })
  }
}

exports.getStudentsByCategory = async (req, res) => {
  let userId = req.params.userId;
  let category = req.params.category;
  if (!userid || !category) {
    res.json({
      status: false,
      msg: "Please give userId and category into params!!"
    })
  }
  let filter = {
    "userId": userId,
    "category": category
  }
  let studentsByCategory = await addmemberModel.find(filter);
  if (!studentsByCategory) {
    res.json({
      status: false,
      msg: "Having error while fetching data!!"
    })
  } else {
    res.json({
      status: false,
      msg: "Please find the data",
      data: studentByCategory
    })
  }

}

exports.std_program = async (req, res) => {
  // {userId:req.params.userId}
  program.find({
    $or: [{
      userId: req.params.userId
    }, {
      status: 'Admin'
    }]
  })
    .select('programName')
    .exec((err, resp) => {
      if (err) {
        res.send({
          'error': 'program details not found'
        })
      } else {
        if (resp.length > 0) {
          var ary = []
          var list = resp
          Promise.all(list.map(async (item) => {
            var obj = {}
            var stdInfo = await addmemberModal.find({
              program: item.programName
            }, {
              firstName: 1,
              lastName: 1,
              status: 1,
              primaryPhone: 1,
              program: 1,
              programColor: 1,
              category: 1,
              subcategory: 1,
              current_rank_name: 1,
              current_rank_img: 1,
              rating: 1
            }).populate('membership_details')
            var stdCount = await addmemberModal.find({
              program: item.programName
            }).count()
            obj.std_count = stdCount
            obj.program = item.programName
            obj.std_info = stdInfo
            ary.push(obj)
          })).then((resp) => {
            res.send({
              data: ary
            })
          }).catch((err) => {
            res.send({
              error: 'data not found'
            })
          })
        } else {
          res.send({
            msg: 'programs list not found'
          })
        }
      }
    })
}


exports.bluckStd = async (req, res) => {
  var List = req.body.data;
  await Promise.all(
    List.map(async (item) => {
      var memberdetails = item;
      var memberObj = new addmemberModal(memberdetails);
      memberObj.userId = req.params.userId;
      memberObj.save(function (err, data) {
        if (err) {
          res.send({
            error: "member is not add"
          });
        } else {
          if (req.file) {
            cloudUrl
              .imageUrl(req.file)
              .then((stdImgUrl) => {
                addmemberModal
                  .findByIdAndUpdate(data._id, {
                    $set: {
                      memberprofileImage: stdImgUrl
                    },
                  })
                  .then((response) => {
                    // res.send({'res':response})
                    program
                      .findOne({
                        programName: req.body.program
                      })
                      .select("programName")
                      .populate({
                        path: "program_rank",
                        model: "Program_rank",
                        select: "rank_name rank_image",
                      })
                      .exec((err, proData) => {
                        if (err) {
                          res.send({
                            code: 400,
                            msg: "program not found"
                          });
                        } else {
                          var d = proData.program_rank[0];
                          addmemberModal.findByIdAndUpdate({
                            _id: response._id
                          }, {
                            $set: {
                              next_rank_id: d._id,
                              next_rank_name: d.rank_name,
                              next_rank_img: d.rank_image,
                              programID: proData._id,
                            },
                          },
                            (err, mangerank) => {
                              if (err) {
                                res.send({
                                  code: 400,
                                  msg: "manage rank not found",
                                });
                              } else {
                                res.send(mangerank);
                              }
                            }
                          );
                        }
                      });
                  })
                  .catch((err) => {
                    res.send(err);
                  });
              })
              .catch((error) => {
                res.send({
                  error: "image url is not create"
                });
              });
          } else {
            program
              .findOne({
                programName: memberdetails.program
              })
              .select("programName")
              .populate({
                path: "program_rank",
                model: "Program_rank",
                select: "rank_name rank_image",
              })
              .exec(async (err, proData) => {
                if (err || !proData) {
                  res.send({
                    code: 400,
                    msg: "program not find"
                  });
                } else {
                  var d = proData.program_rank[0];
                  await addmemberModal.findByIdAndUpdate({
                    _id: data._id
                  }, {
                    $set: {
                      next_rank_id: d._id,
                      next_rank_name: d.rank_name,
                      next_rank_img: d.rank_image,
                      programID: proData._id,
                    },
                  }
                    // ((err,mangerank)=>{
                    //     if(err){
                    //         res.send({code:400,msg:'manage rank not find of program'})
                    //     }
                    //     else{
                    //          res.send(mangerank)
                    //     }
                    /*})*/
                  );
                }
              });
          }
        }
      });
    })
  )
    .then((resp) => {
      res.send("student add successfully");
    })
    .catch((error) => {
      res.send(error);
    });
};

exports.std_count = async (req, res) => {
  try {
    var resdata = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { intrested: "Camp" }] }).count();
    var resdata1 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { studentType: "Active Student" }] }).count();
    var resdata2 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { studentType: "Former Student" }] }).count();
    var resdata3 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { studentType: "Former Trial" }] }).count();
    var resdata4 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { studentType: "Active Trial" }] }).count();
    var resdata5 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { intrested: "After School" }] }).count();
    var resdata6 = await addmemberModal.find({ $and: [{ userId: req.params.userId }, { studentType: "Leads" }] }).count();
    var total = resdata + resdata1 + resdata2 + resdata3 + resdata4 + resdata5 + resdata6;
    res.json({
      total: total,
      camp: resdata,
      active: resdata1,
      former: resdata2,
      former_trail: resdata3,
      active_trial: resdata4,
      after_school: resdata5,
      leads: resdata6,
    });
  } catch (error) {
    res.send({ error: error.message.replace(/\"/g, ""), success: false })
  }

};

exports.listMember = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId
    })
    .select("firstName")
    .select("lastName")
    .select("memberprofileImage")
    .select("primaryPhone")
    .select("studentType")
    .exec((err, data) => {
      if (err) {
        res.send({
          msg: "member list is not found",
          success: false
        });
      } else {
        if (data.length > 0) {
          res.send(data);
        } else {
          res.send({
            msg: "No member found",
            success: false
          });
        }
      }
    });
};

exports.studentCount = (req, res) => {
  addmemberModal
    .aggregate([{
      $match: {
        userId: req.params.userId
      }
    },
    {
      $group: {
        _id: "$studentType",
        count: {
          $sum: 1
        },
      },
    },
    ])
    .exec((err, stdCount) => {
      if (err) {
        res.send({
          code: 400,
          msg: "student count not found"
        });
      } else {
        var Total = 0;
        stdCount.forEach((ele) => {
          Total = Total + ele.count;
        });
        res.send({
          code: 200,
          Total_std: Total,
          Student_count: stdCount
        });
      }
    });
};

exports.addmember = async (req, res) => {
  var pDetail = await program.findOne({
    programName: req.body.program
  })
  var memberdetails = req.body;
  var memberObj = new addmemberModal(memberdetails);
  memberObj.userId = req.params.userId;
  // memberObj.programColor = pDetail.color
  memberObj.save(function (err, data) {
    if (err) {
      res.send({
        error: "member is not added"
      });
    } else {
      if (req.file) {
        cloudUrl
          .imageUrl(req.file)
          .then((stdImgUrl) => {
            addmemberModal
              .findByIdAndUpdate(data._id, {
                $set: {
                  memberprofileImage: stdImgUrl
                },
              })
              .then((response) => {
                // res.send({'res':response})
                program
                  .findOne({
                    programName: req.body.program
                  })
                  .select("programName")
                  .populate({
                    path: "program_rank",
                    model: "Program_rank",
                    select: "rank_name rank_image",
                  })
                  .exec((err, proData) => {
                    if (err) {
                      res.send({
                        code: 400,
                        msg: "program not found"
                      });
                    } else {
                      var d = proData.program_rank[0];
                      addmemberModal.findByIdAndUpdate({
                        _id: response._id
                      }, {
                        $set: {
                          next_rank_id: d._id,
                          next_rank_name: d.rank_name,
                          next_rank_img: d.rank_image,
                          programID: proData._id,
                        },
                      },
                        (err, mangerank) => {
                          if (err) {
                            res.send({
                              code: 400,
                              msg: "manage rank not found",
                            });
                          } else {
                            res.send({ mangerank: mangerank, message: "Student created successfully", status: true });
                          }
                        }
                      );
                    }
                  });
              })
              .catch((err) => {
                res.send(err);
              });
          })
          .catch((error) => {
            res.send({
              error: "image url is not create"
            });
          });
      } else {
        program
          .findOne({
            programName: req.body.program
          })
          .select("programName")
          .populate({
            path: "program_rank",
            model: "Program_rank",
            select: "rank_name rank_image",
          })
          .exec((err, proData) => {
            if (err || !proData) {
              res.send({
                code: 400,
                msg: "program not find"
              });
            } else {
              var d = proData.program_rank[0];
              addmemberModal.findByIdAndUpdate({
                _id: data._id
              }, {
                $set: {
                  next_rank_id: d._id,
                  next_rank_name: d.rank_name,
                  next_rank_img: d.rank_image,
                  programID: proData._id,
                },
              },
                (err, mangerank) => {
                  if (err) {
                    res.send({
                      code: 400,
                      msg: "manage rank not find of program",
                    });
                  } else {
                    res.send({ mangerank: mangerank, message: "Student created successfully", status: true });
                  }
                }
              );
            }
          });
      }
    }
  });
};

exports.read = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId
    })
    .populate("membership_details")
    .populate("manage_change_rank")
    .exec((err, data) => {
      if (err) {
        res.send({
          error: "member list is not found"
        });
      } else {
        if (data.length > 0) {
          res.send(data);
        } else {
          res.send({
            msg: "member list is empty"
          });
        }
      }
    });
};

exports.active_trial_Std = async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    studentType: "Active Trial"
  }).countDocuments()


  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      studentType: "Active Trial"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, active_trial) => {
      if (err) {
        res.send({
          error: "active trial student is not found"
        });
      } else {
        res.send({ active_trial, totalCount: totalCount, success: true });
      }
    });
};

exports.leads_Std = async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    studentType: "Leads"
  }).countDocuments()

  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      studentType: "Leads"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)

    .exec((err, lead) => {
      if (err) {
        res.send({
          error: "leads student is not found"
        });
      } else {
        res.send({ lead, totalCount: totalCount, success: true });
      }
    });
};

exports.Former_Std = async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    studentType: "Former Student"
  }).countDocuments()


  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      studentType: "Former Student"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, former) => {
      if (err) {
        res.send({
          error: "former student is not found"
        });
      } else {
        res.send({ former, totalCount: totalCount, success: true });
      }
    });
};

exports.active_Std = async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    studentType: "Active Student"
  }).countDocuments()


  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      studentType: "Active Student"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, active_std) => {
      if (err) {
        res.send({
          error: "active student is not found"
        });
      } else {
        res.send({ active_std, totalCount: totalCount, success: true });
      }
    });
};

exports.Former_trial_Std = async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    studentType: "Former Trial"
  }).countDocuments()


  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      studentType: "Former Trial"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, former_trial) => {
      if (err) {
        res.send({
          error: "former trial student is not found"
        });
      } else {
        res.send({ former_trial, totalCount: totalCount, success: true });
      }
    });
};

exports.camp_Std =async (req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    intrested: "Camp"
  }).countDocuments()
  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      intrested: "Camp"
    })
    .populate("membership_details", "mactive_date expiry_date")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, camp) => {
      if (err) {
        res.send({
          error: "camp student not found"
        });
      } else {
        res.send({ camp, totalCount: totalCount, success: true });
      }
    });
};

exports.after_school_Std = async(req, res) => {
  var totalCount = await addmemberModal.find({
    userId: req.params.userId,
    intrested: "After School"
  }).countDocuments()
  var per_page = parseInt(req.params.per_page) || 10
  var page_no = parseInt(req.params.page_no) || 1
  var pagination = {
    limit: per_page,
    skip: per_page * (page_no - 1)
  }
  addmemberModal
    .find({
      userId: req.params.userId,
      intrested: "After School"
    })
    .populate("membership_details")
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec((err, after_school) => {
      if (err) {
        res.send({
          error: "after school student not found"
        });
      } else {
        res.send({ after_school, totalCount: totalCount, success: true  });
      }
    });
};

exports.studentinfo = (req, res) => {
  var studentinfo = req.params.StudentId;
  addmemberModal
    .findById(studentinfo)
    .populate("membership_details")
    .populate("finance_details")
    .populate("myFaimly")
    .exec((err, data) => {
      if (err) {
        res.send({
          error: "member is not found"
        });

      } else {
        res.send(data);
      }
    });
};

exports.lastestMember = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId
    })
    .select("firstName")
    .select("lastName")
    .select("program")
    .select("primaryPhone")
    .select("createdAt")
    .sort({
      createdAt: -1
    })
    .limit(5)
    .exec((err, memberdata) => {
      if (err) {
        res.send({
          error: "member data is not find"
        });
      } else {
        res.send(memberdata);
      }
    });
};

exports.expire_member = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId,
      status: "expired"
    })
    .select("firstName")
    .select("lastName")
    .select("days_expire")
    .select("program")
    .select("primaryPhone")
    .select("status")
    .select("userId")
    .populate("membership_details", "expiry_date")
    .exec((err, expMember) => {
      if (err) {
        res.send({
          error: "member list not found"
        });
      } else {
        res.send(expMember);
      }
    });
};

exports.missuCall_list = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId
    })
    .select("firstName")
    .select("lastName")
    .select("program")
    .select("primaryPhone")
    .select("rating")
    .select("memberprofileImage")
    .populate({
      path: "missYouCall_notes", //array name in addmember modal
      model: "missYouCallNote", //collection name
      select: "Type, date",
      // match : 'urjent'
    })
    .exec((err, list_missUCall) => {
      if (err) {
        res.send({
          error: "student list not find"
        });

      } else {
        res.send(list_missUCall);
      }
    });
};

exports.missuCall_list_urjent = (req, res) => {
  addmemberModal
    .find({
      userId: req.params.userId
    })
    .select("firstName")
    .select("lastName")
    .select("program")
    .select("primaryPhone")
    .select("rating")
    .select("memberprofileImage")
    .populate({
      path: "missYouCall_notes", //array name in addmember modal
      model: "missYouCallNote", //collection name
      select: "Type, date",
      match: "urjent",
    })
    .exec((err, list_missUCall) => {
      if (err) {
        res.send({
          error: "student list not find"
        });

      } else {
        res.send(list_missUCall);
      }
    });
};

exports.expire_this_month = (req, res) => {
  var curDate = new Date();
  addmemberModal.aggregate([{
    $match: {
      $and: [{
        userId: req.params.userId
      },
      {
        $expr: {
          $eq: [{
            $month: "$membership_details"
          }, {
            $month: curDate
          }],
        },
      },
      ],
    },
  },]);
};

exports.birth_this_month = (req, res) => {
  var curDate = new Date();
  addmemberModal.aggregate(
    [{
      $match: {
        $and: [{
          userId: req.params.userId
        },
        {
          $expr: {
            $eq: [{
              $month: "$dob"
            }, {
              $month: curDate
            }]
          }
        },
        {
          $expr: {
            $lt: [{
              $dayOfMonth: curDate
            }, {
              $dayOfMonth: "$dob"
            }],
          },
        },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        dob: 1,
        age: 1,
        day_left: 1,
        memberprofileImage: 1,
        primaryPhone: 1,
        rank: 1,
        birthday_checklist: 1,
        memberprofileImage: 1
      },
    },
    ],
    function (err, docs) {
      if (err) {
        res.send({
          error: "this month birthday data not found"
        });

      } else {
        var options = {
          path: "birthday_checklist",
          model: "birthdaycheckList",
          select: "status createdAt",
        };
        addmemberModal.populate(docs, options, function (err, thisMonth) {
          if (err) {
            res.send({
              error: "birthday checklist not populate"
            });
          } else {
            res.send(thisMonth);
          }
        });
      }
    }
  );
};

exports.trial_this_month = (req, res) => {
  var curDate = new Date();
  addmemberModal.aggregate(
    [{
      $match: {
        $and: [{
          userId: req.params.userId
        },
        {
          studentType: "Active Trials"
        },
        {
          $expr: {
            $eq: [{
              $month: "$createdAt"
            }, {
              $month: curDate
            }]
          }
        },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        class_count: 1,
        leadsTracking: 1,
        primaryPhone: 1,
        membership_details: 1,
        memberprofileImage: 1
      },
    },
    ],
    (err, trial) => {
      if (err) {
        res.send({
          error: "this month active trial student data not found"
        });
      } else {
        var options = {
          path: "membership_details",
          model: "Buy_Membership",
          select: "mactive_date expiry_date",
        };
        addmemberModal.populate(trial, options, (err, result) => {
          if (err) {
            res.send({
              error: "buy membership details is not populate"
            });
          } else {
            res.send(result);
          }
        });
      }
    }
  );
};

//need to cha
exports.collectionModify = async (req, res) => {

  let LittleTiger =  []

  // membership Scrip
  // try {
  //   let users = await User.find();
  //   users.forEach(async element => {
  //     if(element._id !== "619155201e2a465ca222dfe0"){
  //       var membershipObj = new membershipModal(
  //         {"isfavorite":0,"membership_name":"BBC 33 Monthly E","color":"#969696","membership_type":"Taekwondo","duration_time":"33","duration_type":"month","total_price":6897,"down_payment":418,"payment_type":"monthly","balance":6479,"due_every":"1","userId":element._id});
  //       var member = await membershipObj.save();
  //       console.log("member",member)
  //     }
  //   });

  //   res.json({ 
  //     msg: 'success',
  //     users
  //   })
  // } catch (err) {
  //   console.log(err)
  // }
}

exports.birth_next_month = (req, res) => {
  var curDate = new Date();
  var next_month = new Date(
    curDate.getFullYear(),
    curDate.getMonth() + 1,
    curDate.getDate()
  );
  addmemberModal.aggregate(
    [{
      $match: {
        $and: [{
          userId: req.params.userId
        },
        {
          $expr: {
            $eq: [{
              $month: "$dob"
            }, {
              $month: next_month
            }]
          }
        },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        dob: 1,
        age: 1,
        day_left: 1,
        primaryPhone: 1,
        rank: 1,
        birthday_checklist: 1,
        memberprofileImage: 1
      },
    },
    ],
    function (err, docs) {
      if (err) {
        res.send({
          error: "next month birthday data not found"
        });

      } else {
        var options = {
          path: "birthday_checklist", //array name in addmember modal
          model: "birthdaycheckList", //collection name
          select: "status createdAt", // show specific field only
        };
        addmemberModal.populate(docs, options, function (err, thisMonth) {
          if (err) {
            res.send({
              error: "birthday checklist not populate"
            });
          } else {
            res.send(thisMonth);
          }
        });
      }
    }
  );
};

exports.this_month_lead = (req, res) => {
  var curDate = new Date();
  addmemberModal
    .aggregate([{
      $match: {
        $and: [{
          userId: req.params.userId
        },
        {
          studentType: "leads"
        },
        {
          $expr: {
            $eq: [{
              $month: "$createdAt"
            }, {
              $month: curDate
            }]
          }
        },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        leadsTracking: 1,
        primaryPhone: 1,
        userId: 1,
        studentType: 1,
        createdAt: 1,
        memberprofileImage: 1
      },
    },
    ])
    .exec((err, leadMonth) => {
      if (err) {
        res.send({
          error: "leads this month data not found"
        });

      } else {
        res.send(leadMonth);
      }
    });
};

exports.last_three_month = (req, res) => {
  let date = new Date();
  date.setMonth(date.getMonth() - 03);
  let dateInput = date.toISOString();
  addmemberModal
    .aggregate([{
      $match: {
        $and: [{
          userId: req.params.userId
        },
        {
          studentType: "leads"
        },
        {
          $expr: {
            $gt: ["$createdAt", {
              $toDate: dateInput
            }]
          }
        },
        ],
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        leadsTracking: 1,
        primaryPhone: 1,
        userId: 1,
        studentType: 1,
        createdAt: 1,
        memberprofileImage: 1
      },
    },
    ])
    .exec((err, mon) => {
      if (err) {
        res.send("data not found");

      } else {
        res.send(mon);
      }
    });
};

exports.deletemember = (req, res) => {
  var memberID = req.params.memberID;
  addmemberModal.findByIdAndDelete(memberID).exec((err, data) => {
    if (err) {
      res.send({
        error: "member is not delete"
      });
    } else {
      res.send({
        msg: "member is delete"
      });
    }
  });
};

exports.delete_multipal_member = (req, res) => {
  addmemberModal.deleteMany({
    _id: req.body.stdIds
  }).exec((err, resp) => {
    if (err) {
      res.json({
        code: 400,
        msg: "student is not delete"
      });
    } else {
      res.json({
        code: 200,
        msg: "student delete successfully"
      });
    }
  });
};

exports.updatemember = (req, res) => {
  var memberID = req.params.memberID;
  addmemberModal
    .findByIdAndUpdate({
      _id: memberID
    }, req.body)
    .exec((err, data) => {
      if (err) {
        res.send({
          success: false,
          error: "member is not update"
        });
      } else {
        if (req.file) {
          cloudUrl
            .imageUrl(req.file)
            .then((stdimagUrl) => {
              addmemberModal
                .findByIdAndUpdate(data._id, {
                  $set: {
                    memberprofileImage: stdimagUrl
                  },
                })
                .then((response) => {
                  res.send({
                    msg: "member details and profile is update",
                    success: true
                  });
                })
                .catch((error) => {
                  res.send({
                    error: "student image is not update",
                    success: false
                  });
                });
            })
            .catch((error) => {
              res.send({
                success: false,
                error: "image url is not create"
              });
            });
        } else {
          res.send({
            success: true,
            msg: "member is update successfully"
          });
        }
      }
    });
};

function TimeZone() {
  const str = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata"
  });
  const date_time = str.split(",");
  const date = date_time[0];
  const time = date_time[1];
  return {
    Date: date,
    Time: time
  };
}

exports.send_mail_std = (req, res) => {
  if (req.body.email_type == "Email") {
    const emaildata = {
      sendgrid_key: process.env.Email_Key,
      to: req.body.to,
      from_email: req.body.from,
      from_name: "noreply@gmail.com",
    };

    emaildata.subject = req.body.subject;
    emaildata.content = req.body.template;

    sgmail
      .send_via_sendgrid(emaildata)
      .then((resp) => {
        var DT = TimeZone();
        var emailDetail = new sentEmail(req.body);
        emailDetail.sent_date = DT.Date;
        emailDetail.sent_time = DT.Time;
        emailDetail.save((err, resp) => {
          res.send({
            code: 200,
            msg: "email sent successfully"
          });
        });
      })
      .catch((error) => {
        res.send({
          code: 400,
          msg: "email not send"
        });
      });
  } else if (req.body.email_type == "Schedule") { }
};

const client = require("twilio")(process.env.aid, process.env.authkey);

exports.send_sms_std = (req, res) => {
  var number = req.body.number;
  var code = "+1";
  client.messages.create({
    to: number,
    from: "+12192445425",
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
  },
    function (err, data) {
      if (err) {
        res.send({
          error: "msg not set"
        });

      } else {
        res.send({
          msg: "text sms send successfully"
        });
      }
    }
  );
};


exports.getActiveStudents = async (req, res) => {
  let userId = req.params.userId;
  if (!userId) {
    return res.json({
      status: false,
      error: "userId not found in params"
    });
  }

  let students = await addmemberModal.find({
    userId: userId,
    status: 'Active'
  })

  if (!students) {
    res.json({
      status: false,
      error: "Students not found"
    });
  }

  res.json({
    status: true,
    data: students
  });

}

/**This api belongs to studend_program_rank_history;
 * 
 * @param {*} req
 * @param {*} res 
 */

exports.getRankUpdateStripeHistoryByStudentId = async (req, res) => {
  let studentId = req.params.studentId;
  if (!studentId) {
    res.json({
      status: false,
      error: "userId not found in params"
    });
  }
  let student = await addmemberModal.findById(studentId);
  if (!student) {
    res.json({
      status: false,
      error: "Student is not available with this id!!"
    });
  }
  let history = student.rank_update_history;
  if (history.length === 0) {
    return res.json({
      stasus: false,
      error: "Not any history available for this student!!"
    })
  }
  return res.json({
    status: true,
    msg: "Please find the student's rank update history!",
    data: history
  });

}

exports.getRankUpdateTestHistoryByStudentId = async (req, res) => {
  let studentId = req.params.studentId;
  if (!studentId) {
    res.json({
      status: false,
      error: "userId not found in params"
    });
  }
  let student = await addmemberModal.findById(studentId);
  if (!student) {
    res.json({
      status: false,
      error: "Student is not available with this id!!"
    });
  }
  let rankTestHistory = student.rank_update_test_history;
  if (rankTestHistory.lenght === 0) {
    return res.json({
      stasus: false,
      error: "No rank history available for this student!!",
      data: rankTestHistory
    })
  }
  return res.json({
    status: true,
    msg: "Please find the student's rank update history!",
    data: rankTestHistory
  });
}

exports.filter_members = async (req, res) => {
  let userId = req.params.userId;
  let cat = req.body.category;
  let pro = req.body.program;
  let subcat = req.body.subcategory;
  try {
    // await addmemberModal.aggregate(
    //   [
    //     { $match: { "userId": userId } },
    //     { $group: { _id: { program: pro } } },
    //   ])

    // conosle.log(res)
    if (cat && pro && subcat) {
      const response = await addmemberModal
        .find({
          userId: userId,
          $and: [
            { program: pro },
            { category: cat },
            { subcategory: subcat }
          ]
        },
          {
            firstName: 1,
            lastName: 1,
            program: 1,
            category: 1,
            subcategory: 1,
            status: 1,
            current_rank_img: 1,
            primaryPhone: 1,
            class_count: 1,
            updatedAt: 1
          })
      res.status(200).send({
        status: "success",
        data: response
      })
    }
    else if (cat && pro && !subcat) {
      const response = await addmemberModal
        .find({
          userId: userId,
          $and: [
            { program: pro },
            { category: cat }
          ]
        },
          {
            firstName: 1,
            lastName: 1,
            program: 1,
            category: 1,
            subcategory: 1,
            status: 1,
            current_rank_img: 1,
            primaryPhone: 1,
            class_count: 1,
            updatedAt: 1
          })

      res.status(200).send({
        status: "success",
        data: response
      })

    }
    else if (!cat && pro && !subcat) {
      const response = await addmemberModal
        .find({
          userId: userId,
          $and: [
            { program: pro }
          ]
        },
          {
            firstName: 1,
            lastName: 1,
            program: 1,
            category: 1,
            subcategory: 1,
            status: 1,
            current_rank_img: 1,
            primaryPhone: 1,
            class_count: 1,
            updatedAt: 1
          })

      res.status(200).send({
        status: "success",
        data: response
      })
    }
    else {
      res.status(403).send({
        status: "false",
        data: "not found"
      })
    }
  }

  catch (er) {
    res.status(500).send({
      message: er,
      status: "failure"
    })

  }

}

exports.invoice_listing = async (req, res) => {
  var studentinfo = req.params.StudentId;
  var userinfo = req.params.userId;
  addmemberModal
    .find({ _id: studentinfo },
      {
        _id: 1
      }
    )
    .populate("membership_details",
      {
        membership_name: 1,
        membership_status: 1,
        ptype: 1,
        totalp: 1,
        due_every_month: 1,
        // "status": {
        //   $cond: [{ $gt: ["$due_every_month", "$payment_Date"] }, "overdue", "paid"]
        // }
      })
    .exec((err, data) => {
      if (err) {
        res.send({ error: 'membership list is not find' });
      }
      else {
        res.status(200).send({ data: data[0], success: true })

      }
    })
}


exports.invoice_details = (req, res) => {
  //PAYMENT-METHOD MUST BE THERE
  var studentinfo = req.params.StudentId;
  // var userinfo = req.params.userId;
  addmemberModal
    .find({ _id: studentinfo },
      {
        billing_to: {
          firstName: "$firstName",
          lastName: "$lastName",
          address: "$address",
          country: "$country",
          state: "$state",
          zipPostalCode: "$zipPostalCode"
        },
        _id: 0

      }
    )
    .populate("membership_details", { payment_type: 1, totalp: 1, due_every_month: 1, pay_latter: 1 })
    .exec((err, data) => {
      if (err) {
        res.send({ error: err.message.replace(/\"/g, ""), success: false })

      }
      else {
        res.status(200).send({ data: data, success: true })

      }
    })
}


exports.ActiveMemberslist = async (req, res) => {
  try {
    let userId = req.params.userId;

    await addmemberModal.find({ userId: userId, status: 'Active' }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User not found'
        });
      }
      else {
        return res.status(200).send({
          data: user,
          success: true,
          error: false
        })
      }
    });
  }

  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })

  }
};


exports.ActiveMemberslistByProgramName = async (req, res) => {
  try {
    let program = req.params.programName
    let userId = req.params.userId;

    await addmemberModal.find({ userId: userId, status: 'Active', program: program }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User not found'
        });
      }
      else {
        return res.status(200).send({
          data: user,
          success: true,
          error: false
        })
      }
    });
  }

  catch (err) {
    res.send({ error: err.message.replace(/\"/g, ""), success: false })

  }
};
