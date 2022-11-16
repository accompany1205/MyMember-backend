const Form = require("../../models/builder/Form.js");
const addmember = require("../../models/addmember.js");
const Funnel = require("../../models/builder/funnel")

const stripe = require("stripe")("sk_test_v9");
const ObjectId = require("mongodb").ObjectId;


exports.createFunnel = async (req, res) => {
  let userId = req.params.userId;
  if (!userId) {
    return res.send({ success: false, msg: "specify school!" });
  }
  try {
    const data = req.body;
    data.userId = userId;
    let funnel = new Funnel(data);
    let resp = await funnel.save();
    res.send({ success: true, msg: "funnel created!" });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}

exports.getSingleFunnel = async (req, res) => {
  let funnelId = req.params.funnelId;
  if (!funnelId) {
    return res.send({ success: false, msg: "No funnel id!" });
  }
  try {
    let data = await Funnel.findOne({_id:funnelId, isDeleted:false});
    if(!data){
      return res.send({msg:"No Funnel", success:true});
    }
    res.send({data:data, msg:"data!", success:true});
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}

exports.getFunnel = async (req, res) => {
  let userId = req.params.userId;
  if (!userId) {
    return res.send({ success: false, msg: "specify school!" });
  }
  try {
    const count = await Funnel.find({ userId: userId, isDeleted: false }).countDocuments();
    var per_page = parseInt(req.params.per_page) || 5;
    var page_no = parseInt(req.params.page_no) || 0;
    var pagination = {
      limit: per_page,
      skip: per_page * page_no,
    };
    Funnel.find({ userId: userId, isDeleted: false })
      .sort({
        createdAt: -1,
      })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .exec((err, memberdata) => {
        if (err) {
          res.send({
            msg: "member data is not find",
            success: false,
          });
        } else {
          res.send({ memberdata, totalCount: count, success: true });
        }
      });
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}

exports.updateFunnel = async (req, res) => {
  let funnelId = req.params.funnelId;
  let userId = req.params.userId;
  if (!userId || !funnelId) {
    return res.send({ success: false, msg: "No funnel/school id!" });
  }
  try {
    let body = req.body;
    let formId = req.body.formId;
    if (body.formId) {
      body.formId = ObjectId(formId);
    }
    let data = await Funnel.updateOne({ _id: funnelId }, { $set: body });
    if (data.nModified < 1) {
      res.send({ msg: "not Updated!", success: false });
    }
    console.log(data)
    res.send({ msg: "Updated Funnel!", success: true })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}

exports.deletedFunnel = async (req, res) => {
  let funnelId = req.params.funnelId;
  try {
    let deleted = await Funnel.updateOne({ _id: funnelId }, { $set: { isDeleted: true } });
    if (deleted.nModified < 1) {
      return res.send({ msg: "Not Deleted!", success: false });
    }
    res.send({ success: true, msg: "Deleted!" })
  } catch (err) {
    res.send({ msg: err.message.replace(/\"/g, ''), success: false })
  }
}

exports.viewForm = async (req, res) => {
  console.log("FormID: ", req.params.formId, "UserID: ", req.params.userId);

  let id = req.params.formId;
  let userId = req.params.userId; //"606aea95a145ea2d26e0f1ab"
  let form = await Form.findOne({ _id: req.params.formId });
  let includePayment = form.includePayment;
  let html = form.formBody;

  if (includePayment == true) {
    //html = html.replace('<body>', '<body><form method="post" id="payment-form" action="/builder/view/process/newstudent/'+ id +'">')
    html = html.replace(
      "<body>",
      '<body><form method="post" id="payment-form" action="/builder/view/process/newstudent/' +
      id +
      "/" +
      userId +
      '">'
    );
  } else {
    //html = html.replace('<body>', '<body><form method="post" action="/builder/view/process/newstudent/'+ id +'">')
    html = html.replace(
      "<body>",
      '<body><form method="post" action="/builder/view/process/newstudent/' +
      id +
      "/" +
      userId +
      '">'
    );
  }

  //html = html.replace('<body>', '<body><form method="post" action="/builder/view/process/newstudent/'+ id + '/' + userId +'">')
  html = html.replace("</body>", "</form></body>");

  let css = form.formStyle;
  let js = form.formScript;
  let title = form.title;

  res.render("index", {
    title: title,
    html: html,
    css: css,
    js: js,
  });
};

exports.viewPaymentStatus = async (req, res) => {
  res.sendFile(path.join(__dirname + "/template/payment-status.html"));
};

exports.showPaymentSuccess = async (req, res) => {
  res.sendFile(path.join(__dirname + "/template/payment-success.html"));
};

exports.showPaymentError = async (req, res) => {
  res.sendFile(path.join(__dirname + "/template/payment-error.html"));
};

exports.createSecret = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: 123,
      transfer_data: {
        destination: "{{CONNECTED_ACCOUNT_ID}}",
      },
    });
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) { }
};

exports.chargeAccount = async (req, res) => {
  const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
};

exports.processForm = async (req, res) => {
  let formId = req.params.formId;

  try {
    console.log("Processing Form");
    console.log("Req.body::", req.body);
    console.log(
      "first-name::",
      typeof req.body.firstname,
      req.body.firstname[0],
      req.body.firstname[1]
    );

    console.log("req.body::", Array.isArray(req.body.firstname));

    let formId = req.params.formId;
    let userId = req.params.userId;

    console.log("userId::", userId, "formId:", formId);

    //Contact Info
    let memberType = "Leads" || req.body.memberType;
    let memberId = req.body.memberId;

    // Member Info
    let firstName =
      req.body.firstname && Array.isArray(req.body.firstname)
        ? req.body.firstname[0]
        : req.body.firstname;
    let lastName =
      req.body.lastname && Array.isArray(req.body.lastname)
        ? req.body.lastname[0]
        : req.body.lastname;
    let gender =
      req.body.gender && Array.isArray(req.body.gender)
        ? req.body.gender[0]
        : req.body.gender;
    let dob =
      req.body.dob && Array.isArray(req.body.dob)
        ? req.body.dob[0]
        : req.body.dob;
    let age =
      req.body.age && Array.isArray(req.body.age)
        ? req.body.age[0]
        : req.body.age;
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;
    let postal = req.body.postal;
    let zipCode = req.body.zipcode;
    let country = req.body.country;
    let phone1 =
      req.body.phone && Array.isArray(req.body.phone)
        ? req.body.phone[0]
        : req.body.phone;
    let phone2 =
      req.body.phone && Array.isArray(req.body.phone)
        ? req.body.phone[1]
        : req.body.phone;
    let email = req.body.email;

    //Buyer Info
    let buyerFirstName =
      req.body.firstname && Array.isArray(req.body.firstname)
        ? req.body.firstname[1]
        : req.body.firstname;
    let buyerLastName =
      req.body.lastname && Array.isArray(req.body.lastname)
        ? req.body.lastname[1]
        : req.body.lastname;
    let buyerGender =
      req.body.gender && Array.isArray(req.body.gender)
        ? req.body.gender[1]
        : req.body.gender;
    let buyerDob =
      req.body.dob && Array.isArray(req.body.dob)
        ? req.body.dob[1]
        : req.body.dob;
    let buyerAge =
      req.body.age && Array.isArray(req.body.age)
        ? req.body.age[1]
        : req.body.age;

    //custom info
    let leadsTracking = req.body.leads;

    let form = await Form.findOne({ _id: formId });
    form.number_of_submissions += 1;
    await form.save();

    let newmember = await addmember();

    newmember.userId = userId;

    //contact info
    newmember.studentType = memberType;
    newmember.memberId = memberId;

    //member info
    newmember.firstName = firstName;
    newmember.lastName = lastName;
    newmember.dob = dob;
    newmember.age = age;
    newmember.gender = gender;
    newmember.email = email;
    newmember.primaryPhone = phone1;
    newmember.secondaryPhone = phone2;
    newmember.street = street;
    newmember.city = city;
    newmember.state = state;
    newmember.country = country;
    newmember.zipPostalCode = zipCode;

    //buyer info
    newmember.buyerInfo.firstName = buyerFirstName;
    newmember.buyerInfo.lastName = buyerLastName;
    newmember.buyerInfo.gender = buyerGender;
    newmember.buyerInfo.dob = buyerDob;
    newmember.buyerInfo.age = buyerAge;

    //custom info
    newmember.leadsTracking = leadsTracking;
    newmember.tags = [];

    await newmember.save();

    //console.log("newmember:::", newmember)
    res.render("success", {
      status: "Form Submitted Successfully",
      formId: formId,
    });
  } catch (error) {
    console.log("Err:", error);

    res.render("error", {
      formId: formId,
    });
  }
};
