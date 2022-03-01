const { functions, add } = require('lodash');
var addmemberModal = require('../models/addmember');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;
const smartList = require('../models/smartlists');
const cloudUrl = require('../gcloud/imageUrl');
const program = require('../models/program');
const rank_change = require('../models/change_rank');
const change_rank = require('../models/change_rank');
const sentEmail = require('../models/emailSentSave');
const sgmail = require('sendgrid-v3-node');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var mongo = require('mongoose');
const User = require('../models/user');
const buymembershipModal = require('../models/buy_membership');
let { saveEmailTemplate } = require('../controllers/compose_template');
const system_folder = require('../models/email_system_folder');
const mergeFile = require('../Services/mergeFile');
const manage_rank = require('../models/program_rank');
const mergeMultipleFiles = require('../Services/mergeMultipleFiles');

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
			success: false,
			msg: 'Please give userId and program into params!!',
		});
	}
	let filter = {
		userId: userId,
		program: program,
	};
	let studentsByProgram = await addmemberModel.find(filter);
	if (!studentsByProgram) {
		res.json({
			success: false,
			msg: 'Having msg while fetching data!!',
		});
	} else {
		res.json({
			success: true,
			msg: 'Please find the data',
			data: studentByProgram,
		});
	}
};

exports.getStudentsByCategory = async (req, res) => {
	let userId = req.params.userId;
	let category = req.params.category;
	if (!userid || !category) {
		res.json({
			success: false,
			msg: 'Please give userId and category into params!!',
		});
	}
	let filter = {
		userId: userId,
		category: category,
	};
	let studentsByCategory = await addmemberModel.find(filter);
	if (!studentsByCategory) {
		res.json({
			success: false,
			msg: 'Having msg while fetching data!!',
		});
	} else {
		res.json({
			success: true,
			msg: 'Please find the data',
			data: studentByCategory,
		});
	}
};

exports.std_program = async (req, res) => {
	// {userId:req.params.userId}
	program
		.find({
			$or: [
				{
					userId: req.params.userId,
				},
				{
					status: 'Admin',
				},
			],
		})
		.select('programName')
		.exec((err, resp) => {
			if (err) {
				res.send({
					success: false,
					msg: 'program details not found',
				});
			} else {
				if (resp.length > 0) {
					var ary = [];
					var list = resp;
					Promise.all(
						list.map(async (item) => {
							var obj = {};
							var stdInfo = await addmemberModal
								.find(
									{
										program: item.programName,
									},
									{
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
										rating: 1,
									}
								)
								.populate('membership_details');
							var stdCount = await addmemberModal
								.find({
									program: item.programName,
								})
								.count();
							obj.std_count = stdCount;
							obj.program = item.programName;
							obj.std_info = stdInfo;
							ary.push(obj);
						})
					)

						.then((resp) => {
							res.send({
								success: true,
								data: ary,
							});
						})
						.catch((err) => {
							res.send({
								success: false,
								msg: 'data not found',
							});
						});
				} else {
					res.send({
						success: false,
						msg: 'programs list not found',
					});
				}
			}
		});
};

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
						success: false,
						msg: 'member is not add',
					});
				} else {
					if (req.file) {
						cloudUrl
							.imageUrl(req.file)
							.then((stdImgUrl) => {
								addmemberModal
									.findByIdAndUpdate(data._id, {
										$set: {
											memberprofileImage: stdImgUrl,
										},
									})
									.then((response) => {
										// res.send({'res':response})
										program
											.findOne({
												programName: req.body.program,
											})
											.select('programName')
											.populate({
												path: 'program_rank',
												model: 'Program_rank',
												select: 'rank_name rank_image',
											})
											.exec((err, proData) => {
												if (err) {
													res.send({
														success: false,
														msg: 'program not found',
													});
												} else {
													var d = proData.program_rank[0];
													addmemberModal.findByIdAndUpdate(
														{
															_id: response._id,
														},
														{
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
																	success: false,
																	msg: 'manage rank not found',
																});
															} else {
																res.send({ data: mangerank, success: true });
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
							.catch((err) => {
								res.send({
									success: false,
									msg: 'image url is not create',
								});
							});
					} else {
						program
							.findOne({
								programName: memberdetails.program,
							})
							.select('programName')
							.populate({
								path: 'program_rank',
								model: 'Program_rank',
								select: 'rank_name rank_image',
							})
							.exec(async (err, proData) => {
								if (err || !proData) {
									res.send({
										success: false,
										msg: 'program not find',
									});
								} else {
									var d = proData.program_rank[0];
									await addmemberModal.findByIdAndUpdate(
										{
											_id: data._id,
										},
										{
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
			res.send({ msg: 'student add successfully', success: true });
		})
		.catch((err) => {
			res.send({ msg: err, success: false });
		});
};

exports.std_count = async (req, res) => {
	try {
		var resdata = await addmemberModal
			.find({ $and: [{ userId: req.params.userId }, { intrested: 'Camp' }] })
			.count();
		var resdata1 = await addmemberModal
			.find({
				$and: [
					{ userId: req.params.userId },
					{ studentType: 'Active Student' },
				],
			})
			.count();
		var resdata2 = await addmemberModal
			.find({
				$and: [
					{ userId: req.params.userId },
					{ studentType: 'Former Student' },
				],
			})
			.count();
		var resdata3 = await addmemberModal
			.find({
				$and: [{ userId: req.params.userId }, { studentType: 'Former Trial' }],
			})
			.count();
		var resdata4 = await addmemberModal
			.find({
				$and: [{ userId: req.params.userId }, { studentType: 'Active Trial' }],
			})
			.count();
		var resdata5 = await addmemberModal
			.find({
				$and: [{ userId: req.params.userId }, { intrested: 'After School' }],
			})
			.count();
		var resdata6 = await addmemberModal
			.find({ $and: [{ userId: req.params.userId }, { studentType: 'Leads' }] })
			.count();
		var total =
			resdata + resdata1 + resdata2 + resdata3 + resdata4 + resdata5 + resdata6;

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
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.listMember = (req, res) => {
	addmemberModal
		.find({
			userId: req.params.userId,
		})
		.select('firstName')
		.select('lastName')
		.select('memberprofileImage')
		.select('primaryPhone')
		.select('studentType')
		.select('status')
		.select('dob')
		.select('email')
		.select('street')
		.select('town')
		.select('country')
		.select('zipPostalCode')
		.select('notes')
		.select('program')
		.select('current_rank_name')
		.select('current_stripe')
		.select('category')
		.select('subcategory')
		.select('location')
		.select('leadsTracking')
		.select('intrested')
		.select('school')
		.select('rating')
		.select('attendedclass_count')
		.select('rank_update_history')
		.select('rank_update_test_history')
		.exec((err, data) => {
			if (err) {
				res.send({
					msg: 'member list is not found',
					success: false,
				});
			} else {
				if (data.length > 0) {
					res.send(data);
				} else {
					res.send({
						msg: 'No member found',
						success: false,
					});
				}
			}
		});
};

exports.studentCount = (req, res) => {
	addmemberModal
		.aggregate([
			{
				$match: {
					userId: req.params.userId,
				},
			},
			{
				$group: {
					_id: '$studentType',
					count: {
						$sum: 1,
					},
				},
			},
		])
		.exec((err, stdCount) => {
			if (err) {
				res.send({
					success: false,
					msg: 'student count not found',
				});
			} else {
				var Total = 0;
				stdCount.forEach((ele) => {
					Total = Total + ele.count;
				});
				res.send({
					Total_std: Total,
					data: stdCount,
					success: true,
				});
			}
		});
};

exports.addmember = async (req, res) => {
	console.log(req.body);

	try {
		var memberdetails = req.body;
		if (memberdetails.after_camp) {
			// memberdetails.after_camp = memberdetails.after_camp
			// 	? JSON.parse(memberdetails.after_camp)
			// 	: [];
			memberdetails.after_camp = [];
		}
		if (memberdetails.buyerInfo) {
			// memberdetails.buyerInfo = memberdetails.buyerInfo
			// 	? JSON.parse(memberdetails.buyerInfo)
			// 	: {};
			memberdetails.buyerInfo = {};
		}
		var memberObj = new addmemberModal(memberdetails);
		memberObj.userId = req.params.userId;

		memberObj.save(function (err, data) {
			if (err) {
				console.log(err);
				res.send({
					success: false,
					msg: 'member is not added',
				});
			} else {
				if (req.file) {
					cloudUrl
						.imageUrl(req.file)
						.then((stdImgUrl) => {
							addmemberModal
								.findByIdAndUpdate(data._id, {
									$set: {
										memberprofileImage: stdImgUrl,
									},
								})
								.then((response) => {
									// res.send({'res':response})
									program
										.findOne({
											programName: req.body.program,
										})
										.select('programName')
										.populate({
											path: 'program_rank',
											model: 'Program_rank',
											select: 'rank_name rank_image',
										})
										.exec((err, proData) => {
											if (err) {
												res.send({
													success: false,
													msg: 'program not found',
												});
											} else {
												var d = proData.program_rank[0] || '';
												addmemberModal.findByIdAndUpdate(
													{
														_id: response._id,
													},
													{
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
																success: false,
																msg: 'manage rank not found',
															});
														} else {
															res.send({
																msg: 'Student created successfully',
																success: true,
																data: data._id,
															});
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
						.catch((err) => {
							res.send({
								msg: 'image url is not create',
								success: false,
							});
						});
				} else {
					program
						.findOne({
							programName: req.body.program,
						})
						.select('programName')
						.populate({
							path: 'program_rank',
							model: 'Program_rank',
							select: 'rank_name rank_image',
						})
						.exec((err, proData) => {
							if (err || !proData) {
								console.log(proData, err);

								res.send({
									success: false,
									msg: 'Please select a Program',
								});
							} else {
								var d = proData.program_rank[0] || '';
								addmemberModal.findByIdAndUpdate(
									{
										_id: data._id,
									},
									{
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
												success: false,
												msg: 'manage rank not find of program',
											});
										} else {
											res.send({
												msg: 'Student created successfully',
												success: true,
												data: data._id,
											});
										}
									}
								);
							}
						});
				}
			}
		});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.read = (req, res) => {
	addmemberModal
		.find({
			userId: req.params.userId,
		})
		.populate('membership_details')
		.populate('manage_change_rank')
		.exec((err, data) => {
			if (err) {
				res.send({
					msg: 'member list is not found',
					success: false,
				});
			} else {
				if (data.length > 0) {
					res.send({ data: data, success: true });
				} else {
					res.send({
						msg: 'member list is empty',
						success: false,
					});
				}
			}
		});
};

exports.active_trial_Std = async (req, res) => {
	// var order = req.query.order || 1
	// let sortBy = req.query.sortBy || "firstName"
	// var totalCount = await addmemberModal
	//   .find({
	//     userId: req.params.userId,
	//     studentType: "Active Trial",
	//   })
	//   .countDocuments();

	// var per_page = parseInt(req.params.per_page) || 10;
	// var page_no = parseInt(req.params.page_no) || 0;
	// var pagination = {
	//   limit: per_page,
	//   skip: per_page * page_no,
	// };
	addmemberModal
		.find({
			userId: req.params.userId,
			studentType: 'Active Trial',
		})
		.populate('membership_details')
		// .skip(pagination.skip)
		// .limit(pagination.limit)
		// .sort({ [sortBy]: order })
		.exec((err, active_trial) => {
			if (err) {
				res.send({
					msg: 'active trial student is not found',
				});
			} else {
				res.send({ active_trial, success: true });
			}
		});
};

exports.leads_Std = async (req, res) => {
	try {
		// var order = req.query.order || 1
		// let sortBy = req.query.sortBy || "firstName"
		// var totalCount = await addmemberModal
		//   .find({
		//     userId: req.params.userId,
		//     studentType: "Leads",
		//   })
		//   .countDocuments();

		// var per_page = parseInt(req.params.per_page) || 10;
		// var page_no = parseInt(req.params.page_no) || 0;
		// var pagination = {
		//   limit: per_page,
		//   skip: per_page * page_no,
		// };
		addmemberModal
			.find({
				userId: req.params.userId,
				studentType: 'Leads',
			})
			.populate('membership_details')
			// .limit(pagination.limit)
			// .skip(pagination.skip)
			// .sort({ [sortBy]: order })
			.exec((err, lead) => {
				if (err) {
					res.send({
						msg: 'leads student is not found',
						success: false,
					});
				} else {
					res.send({ lead, success: true });
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.Former_Std = async (req, res) => {
	// var order = req.query.order || 1
	// let sortBy = req.query.sortBy || "firstName"
	// var totalCount = await addmemberModal
	//   .find({
	//     userId: req.params.userId,
	//     studentType: "Former Student",
	//   })
	//   .countDocuments();

	// var per_page = parseInt(req.params.per_page) || 10;
	// var page_no = parseInt(req.params.page_no) || 0;
	// var pagination = {
	//   limit: per_page,
	//   skip: per_page * page_no,
	// };
	addmemberModal
		.find({
			userId: req.params.userId,
			studentType: 'Former Student',
		})
		.populate('membership_details')
		// .limit(pagination.limit)
		// .skip(pagination.skip)
		// .sort({ [sortBy]: order })
		.exec((err, former) => {
			if (err) {
				res.send({
					msg: 'former student is not found',
					success: false,
				});
			} else {
				res.send({ former, success: true });
			}
		});
};

exports.active_Std = async (req, res) => {
	// var order = req.query.order || 1
	// let sortBy = req.query.sortBy || "firstName"
	// var totalCount = await addmemberModal
	//   .find({
	//     userId: req.params.userId,
	//     studentType: "Active Student",
	//   })
	//   .countDocuments();

	// var per_page = parseInt(req.params.per_page) || 10;
	// var page_no = parseInt(req.params.page_no) || 0;
	// var pagination = {
	//   limit: per_page,
	//   skip: per_page * page_no,
	// };
	addmemberModal
		.find({
			userId: req.params.userId,
			studentType: 'Active Student',
		})
		.populate('membership_details')
		// .limit(pagination.limit)
		// .skip(pagination.skip)
		// .sort({ [sortBy]: order })
		.exec((err, active_std) => {
			if (err) {
				res.send({
					msg: 'active student is not found',
					success: false,
				});
			} else {
				res.send({ active_std, success: true });
			}
		});
};

exports.Former_trial_Std = async (req, res) => {
	// var order = req.query.order || 1
	// let sortBy = req.query.sortBy || "firstName"
	// var totalCount = await addmemberModal
	//   .find({
	//     userId: req.params.userId,
	//     studentType: "Former Trial",
	//   })
	//   .countDocuments();

	// var per_page = parseInt(req.params.per_page) || 10;
	// var page_no = parseInt(req.params.page_no) || 0;
	// var pagination = {
	//   limit: per_page,
	//   skip: per_page * page_no,
	// };
	addmemberModal
		.find({
			userId: req.params.userId,
			studentType: 'Former Trial',
		})
		.populate('membership_details')
		// .limit(pagination.limit)
		// .skip(pagination.skip)
		// .sort({ [sortBy]: order })
		.exec((err, former_trial) => {
			if (err) {
				res.send({
					msg: 'former trial student is not found',
					success: false,
				});
			} else {
				res.send({ former_trial, success: true });
			}
		});
};

exports.camp_Std = async (req, res) => {
	var order = req.query.order || 1;
	let sortBy = req.query.sortBy || 'firstName';
	var totalCount = await addmemberModal
		.find({
			userId: req.params.userId,
			intrested: 'Camp',
		})
		.countDocuments();
	var per_page = parseInt(req.params.per_page) || 10;
	var page_no = parseInt(req.params.page_no) || 0;
	var pagination = {
		limit: per_page,
		skip: per_page * page_no,
	};
	addmemberModal
		.find({
			userId: req.params.userId,
			intrested: 'Camp',
		})
		.populate('membership_details', 'mactive_date expiry_date')
		.limit(pagination.limit)
		.skip(pagination.skip)
		.sort({ [sortBy]: order })
		.exec((err, camp) => {
			if (err) {
				res.send({
					msg: 'camp student not found',
					success: false,
				});
			} else {
				res.send({ camp, totalCount: totalCount, success: true });
			}
		});
};

exports.after_school_Std = async (req, res) => {
	// var order = req.query.order || 1
	// let sortBy = req.query.sortBy || "firstName"
	// var totalCount = await addmemberModal
	//   .find({
	//     userId: req.params.userId,
	//     intrested: "After School",
	//   })
	//   .countDocuments();
	// var per_page = parseInt(req.params.per_page) || 10;
	// var page_no = parseInt(req.params.page_no) || 0;
	// var pagination = {
	//   limit: per_page,
	//   skip: per_page * page_no,
	// };
	addmemberModal
		.find({
			userId: req.params.userId,
			intrested: 'After School',
		})
		.populate('membership_details')
		// .limit(pagination.limit)
		// .skip(pagination.skip)
		// .sort({ [sortBy]: order })
		.exec((err, after_school) => {
			if (err) {
				res.send({
					msg: 'after school student not found',
					success: false,
				});
			} else {
				res.send({ after_school, success: true });
			}
		});
};

exports.studentinfo = (req, res) => {
	var studentinfo = req.params.StudentId;
	var order = req.query.order || 1;
	let sortBy = req.query.sortBy || 'firstName';
	addmemberModal
		.findById(studentinfo)
		.populate({
			path: 'membership_details',
			options: { sort: { ['membership_name']: order } },
		})
		.populate('product_details')
		.populate('finance_details')
		.populate('myFaimly')
		.exec((err, data) => {
			if (err) {
				res.send({
					msg: 'member is not found',
					success: false,
				});
			} else {
				success: false;
				res.send({
					data: data,
					success: true,
				});
			}
		});
};

exports.latestMember = async (req, res) => {
	var totalCount = await addmemberModal
		.find({
			userId: req.params.userId,
		})
		.countDocuments();

	var per_page = parseInt(req.params.per_page) || 5;
	var page_no = parseInt(req.params.page_no) || 0;
	var pagination = {
		limit: per_page,
		skip: per_page * page_no,
	};
	addmemberModal
		.find({
			userId: req.params.userId,
		})
		.select('firstName')
		.select('lastName')
		.select('program')
		.select('primaryPhone')
		.select('createdAt')
		.select('notes')
		.sort({
			createdAt: -1,
		})
		.limit(pagination.limit)
		.skip(pagination.skip)
		.exec((err, memberdata) => {
			if (err) {
				res.send({
					msg: 'member data is not find',
					success: false,
				});
			} else {
				res.send({ memberdata, totalCount: totalCount, success: true });
			}
		});
};

exports.expire_member = (req, res) => {
	addmemberModal
		.find({
			userId: req.params.userId,
			status: 'expired',
		})
		.select('firstName')
		.select('lastName')
		.select('days_expire')
		.select('program')
		.select('primaryPhone')
		.select('status')
		.select('userId')
		.select('notes:1')
		.populate('membership_details', 'expiry_date')
		.exec((err, expMember) => {
			if (err) {
				res.send({
					msg: 'member list not found',
					success: false,
				});
			} else {
				res.send({
					data: expMember,
					success: true,
				});
			}
		});
};

exports.missuCall_list = (req, res) => {
	addmemberModal
		.find({
			userId: req.params.userId,
		})
		.select('firstName')
		.select('lastName')
		.select('program')
		.select('primaryPhone')
		.select('rating')
		.select('memberprofileImage')
		.select('notes')
		.populate({
			path: 'missYouCall_notes', //array name in addmember modal
			model: 'missYouCallNote', //collection name
			select: 'Type, date',
			// match : 'urjent'
		})
		.exec((err, list_missUCall) => {
			if (err) {
				res.send({
					msg: 'student list not find',
					success: false,
				});
			} else {
				res.send({
					data: list_missUCall,
					success: true,
				});
			}
		});
};

exports.missuCall_list_urjent = (req, res) => {
	addmemberModal
		.find({
			userId: req.params.userId,
		})
		.select('firstName')
		.select('lastName')
		.select('program')
		.select('primaryPhone')
		.select('rating')
		.select('memberprofileImage')
		.select('notes')
		.populate({
			path: 'missYouCall_notes', //array name in addmember modal
			model: 'missYouCallNote', //collection name
			select: 'Type, date',
			match: 'urjent',
		})
		.exec((err, list_missUCall) => {
			if (err) {
				res.send({
					msg: 'student list not find',
					success: false,
				});
			} else {
				res.send({
					data: list_missUCall,
					success: true,
				});
			}
		});
};

exports.expire_this_month = (req, res) => {
	var curDate = new Date();
	addmemberModal.aggregate([
		{
			$match: {
				$and: [
					{
						userId: req.params.userId,
					},
					{
						$expr: {
							$eq: [
								{
									$month: '$membership_details',
								},
								{
									$month: curDate,
								},
							],
						},
					},
				],
			},
		},
	]);
};

exports.birth_this_month = (req, res) => {
	var curDate = new Date();
	addmemberModal.aggregate(
		[
			{
				$match: {
					$and: [
						{
							userId: req.params.userId,
						},
						{
							$expr: {
								$eq: [
									{
										$month: '$dob',
									},
									{
										$month: curDate,
									},
								],
							},
						},
						{
							$expr: {
								$lt: [
									{
										$dayOfMonth: curDate,
									},
									{
										$dayOfMonth: '$dob',
									},
								],
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
					memberprofileImage: 1,
					notes: 1,
				},
			},
		],
		function (err, docs) {
			if (err) {
				res.send({
					msg: 'this month birthday data not found',
					success: false,
				});
			} else {
				var options = {
					path: 'birthday_checklist',
					model: 'birthdaycheckList',
					select: 'status createdAt',
				};
				addmemberModal.populate(docs, options, function (err, thisMonth) {
					if (err) {
						res.send({
							msg: 'birthday checklist not populate',
							success: false,
						});
					} else {
						res.send({
							data: thisMonth,
							success: true,
						});
					}
				});
			}
		}
	);
};

exports.trial_this_month = (req, res) => {
	var curDate = new Date();
	addmemberModal.aggregate(
		[
			{
				$match: {
					$and: [
						{
							userId: req.params.userId,
						},
						{
							studentType: 'Active Trials',
						},
						{
							$expr: {
								$eq: [
									{
										$month: '$createdAt',
									},
									{
										$month: curDate,
									},
								],
							},
						},
					],
				},
			},
			{
				$project: {
					firstName: 1,
					lastName: 1,
					attendedclass_count: 1,
					leadsTracking: 1,
					primaryPhone: 1,
					membership_details: 1,
					memberprofileImage: 1,
					notes: 1,
				},
			},
		],
		(err, trial) => {
			if (err) {
				res.send({
					msg: 'this month active trial student data not found',
					success: false,
				});
			} else {
				var options = {
					path: 'membership_details',
					model: 'Buy_Membership',
					select: 'mactive_date expiry_date',
				};
				addmemberModal.populate(trial, options, (err, result) => {
					if (err) {
						res.send({
							msg: 'buy membership details is not populate',
							success: false,
						});
					} else {
						res.send({
							data: result,
							success: true,
						});
					}
				});
			}
		}
	);
};

exports.mergeMultipleDoc = async (req, res) => {
	let studentsIds = req.body.studentsIds;
	let docBody = req.body.docBody;
	try {
		let promises = [];
		let bufCount = 0;
		for (let id in studentsIds) {
			let data = await addmemberModal.findOne({ _id: studentsIds[id] });
			let mergedInfo = { ...data.toJSON() };
			let filebuff = await mergeMultipleFiles(docBody, mergedInfo);
			bufCount = Buffer.byteLength(filebuff) + bufCount;
			promises.push(filebuff);
		}
		await Promise.all(promises);
		res.send({ msg: 'data!', data: promises, success: true });
		// let resultBuff = Buffer.concat(promises, bufCount)
		// console.log(promises)

		// const docx = new DocxMerger({}, resultBuff)
		// docx.save('blob', (data) => {
		// saveAs(data, "output.docx")
		// })

		// let fileObj = {
		//   fieldname: 'attach',
		//   originalname: 'Test.doc',
		//   encoding: '7bit',
		//   mimetype: 'application/doc',
		//   buffer: docx,
		//   size: bufCount
		// }
		// await (cloudUrl.imageUrl(fileObj)).then(data => {
		//   res.send({ msg: "data!", data: data, success: true })
		// })
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.multipleFilter = async (req, res) => {
	let userId = req.params.userId;
	let filters = req.body.filter;
	try {
		let promise = [];
		for (const i in filters) {
			if (filters[i].length && i !== 'membership_type') {
				promise.push({ [i]: { $in: filters[i] } });
			}
		}
		const promises = await Promise.all(promise);
		if (promises.length && filters.membership_type.length) {
			await addmemberModal
				.aggregate([
					{
						$match: {
							$and: promises,
						},
					},
					{
						$project: {
							firstName: 1,
							program: 1,
							current_rank_name: 1,
						},
					},
					{
						$lookup: {
							from: 'buy_memberships',
							localField: '_id',
							foreignField: 'studentInfo',
							as: 'data',
						},
					},
					{
						$match: {
							data: {
								$ne: [],
							},
						},
					},
					{ $unwind: '$data' },
					{
						$match: {
							'data.membership_type': { $in: filters.membership_type },
						},
					},
					// {
					//   $project: {
					//     "membershipIds": "$data.membershipIds",
					//     firstName: 1,
					//     program: 1,
					//     current_rank_name: 1
					//   }
					// },
					// { $unwind: "$membershipIds" },
					// {
					//   $lookup: {
					//     from: "memberships",
					//     localField: "membershipIds",
					//     foreignField: "_id",
					//     as: "memberships"
					//   }
					// },
					// { $unwind: "$memberships" },
					// {
					//   $match: {
					//     "memberships.membership_type": { $in: filters.membership_type },
					//     $and: promises,

					//   }
					// }
				])
				// await addmemberModal.find(...promises, { firstName: 1, lastName: 1, program: 1 })
				//   .populate({
				//     path: "membership_details",
				//     match: req.membership,
				//   })
				// await buymembershipModal.aggregate([{
				//   $match: {
				//     _id: ObjectId("620b38e2a83993228f14c714")
				//   }
				// },
				// {
				//   $project: {
				//     membership_name: 1,
				//     studentInfo: 1
				//   }
				// },
				// {
				//   $lookup: {
				//     from: "members",
				//     localField: "studentInfo",
				//     foreignField: "_id",
				//     as: 'data'
				//   }
				// },
				// ])
				.exec((err, data) => {
					if (err) {
						res.send({
							msg: err.message.replace(/\"/g, ''),
							success: false,
							err,
						});
					} else {
						res.send({ msg: 'Data!', success: true, data: data });
					}
				});
		} else {
			await addmemberModal
				.aggregate([
					{
						$match: {
							$and: promises,
						},
					},
				])
				.exec((err, data) => {
					if (err) {
						res.send({
							msg: err.message.replace(/\"/g, ''),
							success: false,
							err,
						});
					} else {
						res.send({ msg: 'Data!', success: true, data: data });
					}
				});
		}
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

//need to cha
exports.collectionModify = async (req, res) => {
	let LittleTiger = [];
	// var mongo.Types.ObjectId = mongo.Types.mongo.Types.ObjectId()

	// membership Scrip
	try {
		let users = await program.insertMany({
			program_category: [],
			program_rank: [
				'61926ee2e953ff693a3f72fc',
				'61926f46e953ff693a3f7338',
				'61926f61e953ff693a3f7342',
				'61926fc8e953ff693a3f7382',
				'61926fe5e953ff693a3f73b7',
				'61926ffde953ff693a3f73dd',
				'61927016e953ff693a3f73fe',
				'61927031e953ff693a3f743b',
				'6192704ce953ff693a3f7440',
				'61927068e953ff693a3f7461',
				'61927082e953ff693a3f7466',
			],
			programName: 'Little Tiger',
			color: '#88d317',
			lable: 2,
			total_rank: 11,
			progression: 'by time & attendance',
			type: 'By Stripe',
			requirement: 'bottel',
			adminId: '6138893333c9482cb41d88d5',
		});
		//   let users = await User.find();
		//   users.forEach(async element => {
		//     if(element._id !== "619155201e2a465ca222dfe0"){
		//       var membershipObj = new membershipModal(
		//         {"isfavorite":0,"membership_name":"BBC 33 Monthly E","color":"#969696","membership_type":"Taekwondo","duration_time":"33","duration_type":"month","total_price":6897,"down_payment":418,"payment_type":"monthly","balance":6479,"due_every":"1","userId":element._id});
		//       var member = await membershipObj.save();
		//       console.log("member",member)
		//     }
		//   });

		res.send({
			data: users,
			success: true,
		});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.birth_next_month = (req, res) => {
	var curDate = new Date();
	var next_month = new Date(
		curDate.getFullYear(),
		curDate.getMonth() + 1,
		curDate.getDate()
	);
	addmemberModal.aggregate(
		[
			{
				$match: {
					$and: [
						{
							userId: req.params.userId,
						},
						{
							$expr: {
								$eq: [
									{
										$month: '$dob',
									},
									{
										$month: next_month,
									},
								],
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
					primaryPhone: 1,
					rank: 1,
					birthday_checklist: 1,
					memberprofileImage: 1,
					notes: 1,
				},
			},
		],
		function (err, docs) {
			if (err) {
				res.send({
					msg: 'next month birthday data not found',
					success: false,
				});
			} else {
				var options = {
					path: 'birthday_checklist', //array name in addmember modal
					model: 'birthdaycheckList', //collection name
					select: 'status createdAt', // show specific field only
				};
				addmemberModal.populate(docs, options, function (err, thisMonth) {
					if (err) {
						res.send({
							msg: 'birthday checklist not populate',
							success: false,
						});
					} else {
						res.send({
							data: thisMonth,
							success: true,
						});
					}
				});
			}
		}
	);
};

exports.this_month_lead = (req, res) => {
	var curDate = new Date();
	addmemberModal
		.aggregate([
			{
				$match: {
					$and: [
						{
							userId: req.params.userId,
						},
						{
							studentType: 'leads',
						},
						{
							$expr: {
								$eq: [
									{
										$month: '$createdAt',
									},
									{
										$month: curDate,
									},
								],
							},
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
					memberprofileImage: 1,
					notes: 1,
				},
			},
		])
		.exec((err, leadMonth) => {
			if (err) {
				res.send({
					msg: 'leads this month data not found',
					success: false,
				});
			} else {
				res.send({
					data: leadMonth,
					success: true,
				});
			}
		});
};

exports.last_three_month = (req, res) => {
	let date = new Date();
	date.setMonth(date.getMonth() - 03);
	let dateInput = date.toISOString();
	addmemberModal
		.aggregate([
			{
				$match: {
					$and: [
						{
							userId: req.params.userId,
						},
						{
							studentType: 'leads',
						},
						{
							$expr: {
								$gt: [
									'$createdAt',
									{
										$toDate: dateInput,
									},
								],
							},
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
					memberprofileImage: 1,
					notes: 1,
				},
			},
		])
		.exec((err, mon) => {
			if (err) {
				res.send({
					msg: 'data not found',
					success: false,
				});
			} else {
				res.send({
					data: mon,
					success: true,
				});
			}
		});
};

exports.deletemember = (req, res) => {
	var memberID = req.params.memberID;
	addmemberModal.findByIdAndDelete(memberID).exec((err, data) => {
		if (err) {
			res.send({
				msg: 'member is not delete',
				success: false,
			});
		} else {
			res.send({
				msg: 'member is deleted',
				success: true,
			});
		}
	});
};

exports.delete_multipal_member = (req, res) => {
	addmemberModal
		.deleteMany({
			_id: req.body.stdIds,
		})
		.exec((err, resp) => {
			if (err) {
				res.json({
					success: false,
					msg: 'student is not delete',
				});
			} else {
				res.json({
					msg: 'student delete successfully',
					success: true,
				});
			}
		});
};

exports.updatemember = async (req, res) => {
	var memberID = req.params.memberID;
	let userId = req.params.userId;
	let memberData = req.body;
	if (memberData.after_camp) {
		memberData.after_camp = memberData.after_camp
			? JSON.parse(memberData.after_camp)
			: [];
	}
	if (memberData.buyerInfo) {
		memberData.buyerInfo = memberData.buyerInfo
			? JSON.parse(memberData.buyerInfo)
			: {};
	}

	// let [data] = await smartList.find({ "criteria.studentType": memberData.studentType });
	// if (data) {
	// let [data] = await smartList.find({ "criteria.studentType": memberData.studentType });
	// let [Email] = await sentEmail.find({ smartLists: data._id });
	//   if (Email.toJSON().immediately) {
	//     const emailData = {
	//       sendgrid_key: process.env.SENDGRID_API_KEY,
	//       to: memberData.email,
	//       from: Email.toJSON().from,
	//       from_name: 'noreply@gmail.com',
	//       subject: Email.toJSON().subject,
	//       html: Email.toJSON().template,
	//       attachments: Email.toJSON().attachments
	//     };
	//     sgMail.send(emailData)
	//       .then(resp => {
	//         var emailDetail = new sentEmail(req.body)
	//         emailDetail.save((err, emailSave) => {
	//           if (err) {
	//             res.send({ error: 'email details is not save' })
	//           }
	//           else {
	//             sentEmail.findByIdAndUpdate(emailSave._id, { userId: userId, email_type: 'sent', is_Sent: true, category: 'system' })
	//               .exec((err, emailUpdate) => {
	//                 if (err) {
	//                   console.log({ msg: 'emil not sent', err })
	//                 }
	//                 else {
	//                   // res.send({ message: "Email Sent Successfully", success: true, emailUpdate })
	//                 }
	//               })
	//           }
	//         })
	//       })
	//       .catch(err => {
	//         console.log({ msg: 'email not send', error: err })
	//       })
	//   } else {
	//     let sent_date = moment(Email.toJSON().sent_date).add(Email.toJSON().days, 'days').format("YYYY-MM-DD");
	//     const obj = {
	//       to: memberData.email,
	//       from: memberData.email,
	//       subject: Email.toJSON().subject,
	//       template: Email.toJSON().template,
	//       sent_date: sent_date,
	//       sent_time: Email.toJSON().sent_time,
	//       email_type: "scheduled",
	//       email_status: true,
	//       category: "system",
	//       userId: userId,
	//       folderId: Email.toJSON().folderId,
	//       days: Email.toJSON().days,
	//     }
	//     console.log(obj)
	//     saveEmailTemplate(obj)
	//       .then((data) => {
	//         system_folder
	//           .findOneAndUpdate(
	//             { _id: obj.folderId },
	//             { $push: { template: data._id } }
	//           )
	//           .then((data) => {
	//             console.log(`Email scheduled  Successfully on ${sent_date}`)
	//           })
	//           .catch((er) => {
	//             res.send({
	//               msg: "compose template details is not add in folder",
	//               success: er,
	//             });
	//           });
	//       })
	//   }

	// }
	if (req.file) {
		await cloudUrl
			.imageUrl(req.file)
			.then((stdimagUrl) => {
				memberData.memberprofileImage = stdimagUrl;
			})
			.catch((msg) => {
				res.send({
					success: false,
					msg: 'Profile image url not created',
				});
			});
	}
	await addmemberModal
		.findOneAndUpdate({ _id: memberID }, { $set: memberData })
		.exec((err, data) => {
			if (err) {
				res.send({
					success: false,
					msg: 'Member not updated',
				});
			} else {
				res.send({
					success: true,
					msg: 'Member is update successfully',
				});
			}
		});
};

function TimeZone() {
	const str = new Date().toLocaleString('en-US', {
		timeZone: 'Asia/Kolkata',
	});
	const date_time = str.split(',');
	const date = date_time[0];
	const time = date_time[1];
	return {
		Date: date,
		Time: time,
	};
}

exports.send_mail_std = (req, res) => {
	if (req.body.email_type == 'Email') {
		const emaildata = {
			sendgrid_key: process.env.Email_Key,
			to: req.body.to,
			from_email: req.body.from,
			from_name: 'noreply@gmail.com',
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
						msg: 'email sent successfully',
						success: true,
					});
				});
			})
			.catch((msg) => {
				res.send({
					success: false,
					msg: 'email not send',
				});
			});
	} else if (req.body.email_type == 'Schedule') {
	}
};

const client = require('twilio')(process.env.aid, process.env.authkey);

exports.send_sms_std = (req, res) => {
	var number = req.body.number;
	var code = '+1';
	client.messages.create(
		{
			to: number,
			from: '+12192445425',
			body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
		},
		function (err, data) {
			if (err) {
				res.send({
					msg: 'msg not set',
					success: false,
				});
			} else {
				res.send({
					msg: 'text sms send successfully',
					success: true,
				});
			}
		}
	);
};

exports.getActiveStudents = async (req, res) => {
	let userId = req.params.userId;
	if (!userId) {
		return res.json({
			msg: 'userId not found in params',
			success: false,
		});
	}

	let students = await addmemberModal.find({
		userId: userId,
		status: 'Active',
	});

	if (!students) {
		res.json({
			msg: 'Students not found',
			success: false,
		});
	}

	res.json({
		data: students,
		success: true,
	});
};

/**This api belongs to studend_program_rank_history;
 *
 * @param {*} req
 * @param {*} res
 */

exports.getRankUpdateStripeHistoryByStudentId = async (req, res) => {
	let studentId = req.params.studentId;
	if (!studentId) {
		res.json({
			msg: 'userId not found in params',
			success: false,
		});
	}
	let student = await addmemberModal.findById(studentId);
	if (!student) {
		res.json({
			msg: 'Student is not available with this id!!',
			success: false,
		});
	}
	let history = student.rank_update_history;
	if (history.length === 0) {
		return res.json({
			msg: 'Not any history available for this student!!',
			success: false,
		});
	}
	return res.json({
		data: history,
		success: true,
	});
};

exports.getRankUpdateTestHistoryByStudentId = async (req, res) => {
	let studentId = req.params.studentId;
	if (!studentId) {
		res.json({
			msg: 'userId not found in params',
			success: false,
		});
	}
	let student = await addmemberModal.findById(studentId);
	if (!student) {
		res.json({
			msg: 'Student is not available with this id!!',
			success: false,
		});
	}
	let rankTestHistory = student.rank_update_test_history;
	if (rankTestHistory.lenght === 0) {
		return res.json({
			success: false,
			msg: 'No rank history available for this student!!',
		});
	}
	return res.json({
		data: rankTestHistory,
		success: true,
	});
};

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
			const response = await addmemberModal.find(
				{
					userId: userId,
					$and: [{ program: pro }, { category: cat }, { subcategory: subcat }],
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
					attendedclass_count: 1,
					updatedAt: 1,
				}
			);
			res.status(200).send({
				data: response,
				success: true,
			});
		} else if (cat && pro && !subcat) {
			const response = await addmemberModal.find(
				{
					userId: userId,
					$and: [{ program: pro }, { category: cat }],
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
					attendedclass_count: 1,
					updatedAt: 1,
				}
			);

			res.status(200).send({
				data: response,
				success: true,
			});
		} else if (!cat && pro && !subcat) {
			const response = await addmemberModal.find(
				{
					userId: userId,
					$and: [{ program: pro }],
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
					attendedclass_count: 1,
					updatedAt: 1,
				}
			);

			res.status(200).send({
				data: response,
				success: true,
			});
		} else {
			res.status(403).send({
				data: 'not found',
				success: false,
			});
		}
	} catch (er) {
		res.status(500).send({
			msg: er,
			success: false,
		});
	}
};

exports.invoice_listing = async (req, res) => {
	var studentinfo = req.params.StudentId;
	var userinfo = req.params.userId;
	addmemberModal
		.find(
			{ _id: studentinfo },
			{
				_id: 1,
			}
		)
		.populate('membership_details', {
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
				res.send({
					msg: 'membership list is not find',
					success: false,
				});
			} else {
				res.status(200).send({ data: data[0], success: true });
			}
		});
};

exports.invoice_details = (req, res) => {
	//PAYMENT-METHOD MUST BE THERE
	var studentinfo = req.params.StudentId;
	// var userinfo = req.params.userId;
	addmemberModal
		.find(
			{ _id: studentinfo },
			{
				billing_to: {
					firstName: '$firstName',
					lastName: '$lastName',
					address: '$address',
					country: '$country',
					state: '$state',
					zipPostalCode: '$zipPostalCode',
				},
				_id: 0,
			}
		)
		.populate('membership_details', {
			payment_type: 1,
			totalp: 1,
			due_every_month: 1,
		})
		.exec((err, data) => {
			if (err) {
				res.send({ msg: err.message.replace(/\"/g, ''), success: false });
			} else {
				res.status(200).send({ data: data, success: true });
			}
		});
};

exports.ActiveMemberslist = async (req, res) => {
	try {
		let userId = req.params.userId;

		await addmemberModal
			.find({ userId: userId, status: 'Active' })
			.exec((err, user) => {
				if (err || !user) {
					return res.status(400).json({
						msg: 'User not found',
						success: false,
					});
				} else {
					return res.status(200).send({
						data: user,
						success: true,
					});
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.ActiveMemberslistByProgramName = async (req, res) => {
	try {
		let program = req.params.programName;
		let userId = req.params.userId;

		await addmemberModal
			.find({ userId: userId, status: 'Active', program: program })
			.exec((err, user) => {
				if (err || !user) {
					return res.status(400).json({
						msg: 'User not found',
						success: false,
					});
				} else {
					return res.status(200).send({
						data: user,
						success: true,
					});
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.searchStudentbyType = async (req, res) => {
	const userId = req.params.userId;
	const studentType = req.params.studentType;
	const search = req.query.search;
	try {
		if (search.split(' ').length > 1) {
			search1 = search.split(' ')[0];
			search2 = search.split(' ')[1];
			const data = await addmemberModal.find({
				userId: userId,
				studentType: studentType,
				$or: [
					{ firstName: { $regex: search1, $options: 'i' } },
					{ lastName: { $regex: search2, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				],
			});
			return res.send({
				data: data,
				success: true,
			});
		}

		const data = await addmemberModal.find({
			userId: userId,
			studentType: studentType,
			$or: [
				{ firstName: { $regex: search, $options: 'i' } },
				{ lastName: { $regex: search, $options: 'i' } },
				// { lastName: { $regex: search1, $options: "i" } },
				{ email: { $regex: search, $options: 'i' } },
			],
		});
		res.send({
			data: data,
			success: true,
		});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.searchStudentbyInterest = async (req, res) => {
	const search = req.query.search;
	const userId = req.params.userId;
	const interest = req.params.intrested;
	try {
		const data = await addmemberModal.find({
			userId: userId,
			intrested: interest,
			$or: [
				{ firstName: { $regex: search, $options: 'i' } },
				{ lastName: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
			],
		});
		res.send({
			data: data,
			success: true,
		});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.active_trial_this_month = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Active Trial',
						$expr: {
							$eq: [{ $month: '$createdAt' }, { $month: new Date() }],
						},
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						let data = memberdata[0].paginatedResults;
						if (data.length > 0) {
							res.send({
								data: data,
								totalCount: memberdata[0].totalCount[0].count,
								success: true,
							});
						} else {
							res.send({ msg: 'data not found', success: false });
						}
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.active_trial_past3_month = async (req, res) => {
	try {
		const userId = req.params.userId;
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Active Trial',
					},
				},

				{
					$project: {
						firstName: 1,
						lastName: 1,
						status: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
						dayssince: {
							$floor: {
								$divide: [
									{ $subtract: [new Date(), '$createdAt'] },
									1000 * 60 * 60 * 24,
								],
							},
						},
					},
				},

				{ $match: { dayssince: { $lte: 90 } } },

				{
					$sort: {
						dayssince: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])

			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						suceess: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						res.send({
							data: data,
							totalCount: memberdata[0].totalCount[0].count,
							success: true,
						});
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};

exports.leads_this_month = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Leads',
						$expr: {
							$eq: [{ $month: '$createdAt' }, { $month: new Date() }],
						},
					},
				},
				{
					$project: {
						createdAt: 1,
						status: 1,
						firstName: 1,
						lastName: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						res.send({
							data: data,
							totalCount: memberdata[0].totalCount[0].count,
							success: true,
						});
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};
exports.leads_past3_month = async (req, res) => {
	const userId = req.params.userId;

	try {
		var per_page = parseInt(req.params.per_page) || 5;
		var page_no = parseInt(req.params.page_no) || 0;
		var pagination = {
			limit: per_page,
			skip: per_page * page_no,
		};
		await addmemberModal
			.aggregate([
				{
					$match: {
						userId: userId,
						studentType: 'Leads',
					},
				},

				{
					$project: {
						firstName: 1,
						lastName: 1,
						status: 1,
						program: 1,
						primaryPhone: 1,
						studentType: 1,
						createdAt: 1,
						primaryPhone: 1,
						notes: 1,
						dayssince: {
							$floor: {
								$divide: [
									{ $subtract: [new Date(), '$createdAt'] },
									1000 * 60 * 60 * 24,
								],
							},
						},
					},
				},

				{ $match: { dayssince: { $lte: 90 } } },

				{
					$sort: {
						dayssince: -1,
					},
				},

				{
					$facet: {
						paginatedResults: [
							{ $skip: pagination.skip },
							{ $limit: pagination.limit },
						],
						totalCount: [
							{
								$count: 'count',
							},
						],
					},
				},
			])
			.exec((err, memberdata) => {
				if (err) {
					res.send({
						msg: err,
						success: false,
					});
				} else {
					let data = memberdata[0].paginatedResults;
					if (data.length > 0) {
						res.send({
							data: data,
							totalCount: memberdata[0].totalCount[0].count,
							success: true,
						});
					} else {
						res.send({ msg: 'data not found', success: false });
					}
				}
			});
	} catch (err) {
		res.send({ msg: err.message.replace(/\"/g, ''), success: false });
	}
};
