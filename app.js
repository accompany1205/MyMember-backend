const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fileUpload = require("express-fileupload");
const expressValidator = require("express-validator");
require("dotenv").config();
const socketio = require("socket.io");
require("./config/db");

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const stripeRoutes = require("./routes/stripe");
const categoryRoutes = require("./routes/category");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");


//ttl
const TTL = require("./routes/attl");

//middlewear
const middleware = require("./middlewear/middlewear");

//shivani's
const leads_tracking = require("./routes/leads_tracking");
const userSectionFiles = require("./routes/userSectionFiles");
const after_camp = require("./routes/after_camp");
const summer_camp = require("./routes/summer_camp");
const speciality_program1 = require("./routes/speciality_program1");
const speciality_program2 = require("./routes/speciality_program2");
const smartlists = require("./routes/smartlists");
const smartlistFolder = require("./routes/smartlist_folder");
const administrate_user = require("./routes/administrater_user");
const programRoutes = require("./routes/program");
const manageRankRoutes = require("./routes/program_rank");
const studentINfoRank = require("./routes/student_info_Rank");
const candidate = require("./routes/candidate");
const candidate_stripe = require("./routes/candidate_stripe");
const todo_api = require("./routes/todo_apis");
const Tasks = require("./routes/tasks");
const taskFolder = require("./routes/task_folder");
const taskSubFolder = require("./routes/task_subfolder");
const Goals = require("./routes/gloals");
const goalsFolder = require("./routes/goals_folder");
const goalsSubFolder = require("./routes/goals_subfolder");
const Dashboard = require("./routes/dashboard");

const adminstrate = require("./routes/administrater_user");
const goal_settings = require("./routes/goal_setting");
const goals_api = require("./routes/goals_api");
const class_schedule = require("./routes/class_schedule");
const attendence = require("./routes/attendence");
const campaign_type = require("./routes/campaign_type");
const organization_setup = require("./routes/organization_setup");
const category_manag = require("./routes/category_manag");
const appointment = require("./routes/appointment");
const events = require("./routes/events");
const add_member = require("./routes/addmember");
const productFolder = require("./routes/productFolder");
const product = require("./routes/product");
const buy_product = require("./routes/buy_product");
const pcategory = require("./routes/pcategory");
const psubcategory = require("./routes/psubcategory");
const add_membership = require("./routes/membership");
const finance_info = require("./routes/finance_info");
const bymember_ship = require("./routes/buy_membership");
const membershipFolderRoute = require("./routes/membershipFolder");
const purchaseMembership = require("./routes/purchaseMemberships");
const withdraw_funds = require("./routes/withdraw_fund");
const family_member = require("./routes/family_member");
const my_group = require("./routes/my_group");
const camp = require("./routes/camp");
const test_purchase = require("./routes/test_purchase");
const test = require("./routes/Test");
const expense = require("./routes/expences");
const expences_category = require("./routes/expenses_category");
const student_appoinment = require("./routes/student_appoinment");
const birthday_appoinment = require("./routes/birthday_appoinment");
const renewal_notes = require("./routes/renewal_note");
const birthday_notes = require("./routes/birthday_notes");
const followup_notes_router = require("./routes/followup_notes");
const birthday_checklist = require("./routes/birthday_checklist");
const support = require("./routes/support");
const misucall_appoinment = require("./routes/misucall_appoinment");
const misucall_notes = require("./routes/misucall_notes");
const all_appoinment = require("./routes/all_appoinment");
const email_system = require("./routes/email_system_Category");
const email_system_folder = require("./routes/email_system_folder");
const email_compose = require("./routes/email_compose_Category");
const email_compose_folder = require("./routes/email_compose_folder");
const email_nurturing = require("./routes/email_nurturing_Category");
const email_nurturing_folder = require("./routes/email_nurturing_folder");
const email_library = require("./routes/email_library_Category");
const email_library_folder = require("./routes/email_library_folder");
const system_template = require("./routes/email_system_template");
const compose_template = require("./routes/compose_template");
const nurturing_template = require("./routes/nurturing_template");
const library_template = require("./routes/library_template");
// const emailSystem = require("./routes/emailSystem")
const text_sms = require("./routes/text_sms_general");
const text_genral = require("./routes/text_general");
const text_genral_folder = require("./routes/text_general_folder");
const text_nurturing = require("./routes/text_nurturing");
const text_nurturing_folder = require("./routes/text_nurturing_folder");
const text_nurturing_template = require("./routes/text_nurturing_template");
const text_Library = require("./routes/text_library");
const text_Library_Folder = require("./routes/text_library_folder");
const document_folder = require("./routes/doc_folder");
const document_subFolder = require("./routes/doc_subfolder");
const upload_doc = require("./routes/doc_upload");
const finance_list = require("./routes/finance_list");
const student_email = require("./routes/std_temp_list");
const student_text = require("./routes/std_text_list");
const tutorial = require("./routes/tutorials");
const tutFolder = require("./routes/tut_folder");
const tutSubFolder = require("./routes/tut_subfolder");

//stripePaymentGateway
const stripePaymentGateway = require("./controllers/stripePaymentGateway/index");

//docuSign
const signStates = require("./routes/signStates");

//admin routes
const manage_user = require("./routes/admin/manage_user");
const admin_email_system_cat = require("./routes/admin/email_manage/system/admin_system_category");
const admin_email_compose_cat = require("./routes/admin/email_manage/compose/admin_compose_category");
const admin_email_nurturing_cat = require("./routes/admin/email_manage/nurturing/admin_nurturing_category");
const admin_email_system_folder = require("./routes/admin/email_manage/system/admin_system_folder");
const admin_email_compose_folder = require("./routes/admin/email_manage/compose/admin_compose_folder");
const admin_email_nurturing_folder = require("./routes/admin/email_manage/nurturing/admin_nurturing_folder");
const admin_email_system_template = require("./routes/admin/email_manage/system/admin_system_template");
const admin_email_compose_template = require("./routes/admin/email_manage/compose/admin_compose_template");
const admin_email_nurturing_template = require("./routes/admin/email_manage/nurturing/admin_nurturing_template");
const location = require("./routes/admin/settings/location");
const admin_membership = require("./routes/admin/membership_management/admin_membership");
const admin_membershipFolder = require("./routes/admin/membership_management/admin_membershipFolder");
const admin_product = require("./routes/admin/product_manage/admin_product");
const admin_productFolder = require("./routes/admin/product_manage/admin_productFolder");
const admin_program = require("./routes/admin/program_manage/admin_program");
const admin_programCategory = require("./routes/admin/program_manage/admin_programCategory");
const admin_programRanks = require("./routes/admin/program_manage/admin_programRanks");
const admin_candidate = require("./routes/admin/candidate_manage/admin_candidate");
const admin_document_folder = require("./routes/admin/document_manage/admin_doc_folder");
const admin_document_subFolder = require("./routes/admin/document_manage/admin_doc_subfolder");
const admin_upload_doc = require("./routes/admin/document_manage/admin_doc_upload");
const admin_candidateStripes = require("./routes/admin/candidate_manage/admin_candidatesStripes");
const admin_smartlists = require("./routes/admin/smartlist_management/admin_smartlist");
const admin_smartlistFolder = require("./routes/admin/smartlist_management/admin_smartlist_folders");
const admin_leads_tracking = require("./routes/admin/leads_tracking_manage/admin_leads_tracking");
const admin_after_camp = require("./routes/admin/after_camp_manage/admin_after_camp");
const admin_expense_category = require("./routes/admin/finance_manage/admin_expenses_category");
const admin_tutorial = require("./routes/admin/tut_manage/admin_tutorials");
const admin_tutFolder = require("./routes/admin/tut_manage/admin_tut_folder");
const admin_tutsubFolder = require("./routes/admin/tut_manage/admin_tut_subfolder");
const admin_text_template = require("./routes/admin/text_temp_manage/admin_text_templates");
const permission_of_sub_users = require("./routes/permissionsOfSubUsers");
const admin_appointment_cat = require("./routes/admin/appointment_event_manage/admin_appointment_event");
const admin_support = require("./routes/admin/support_manage/admin_support");

//menu routes
const student_menu = require("./routes/menu/std_menu/all_student_menu");

//school auth key email,text,payment get way
const emailKey = require("./routes/email_key");
const textkey = require("./routes/text_key");
const sample_doc = require("./routes/admin/upload_sample_file");

//School
const recomendedForTestRoutes = require("./routes/recommendedForTest");
const registeredForTestRoutes = require("./routes/registerdForTest");
const recommendedCandidatesRoutes = require("./routes/recommededCandidate");

const textTemplateRoutes = require("./routes/text_templates_routes");
const textChatRoutes = require("./routes/text_chat_routes");
const chatbotUsersRoutes = require("./routes/chatbot_users");

const appointmentEvent = require("./routes/appointment_event");
const finance = require("./routes/finance");

//Form builder Routes
const builderRoutes = require("./routes/builder/routes")
const viewFormRoutes = require("./routes/builder/view-form")


const app = express();
// app.use(fileUpload({ safeFileNames: true, preserveExtension: true }))
const { v4: uuidv4 } = require("uuid");

const server = http.createServer(app);
const io = socketio(server);
app.set("socketio", io);
const engineSocket = require("./Services/scoket.io");
new engineSocket(io);

const followup_notes = require("./models/followup_notes");
uuidv4();
// status check expire or not

//statics
const statictics = require("./routes/statictics");

//all cron job
const statusCheck = require("./notice/status");
const purchaseMemberships = require("./models/purchaseMemberships");

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  express.json({
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/api/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(express.urlencoded({ extended: false }));

//ejs
//app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));

// app.use('/', express.static(path.join(__dirname, '')));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(expressValidator());
var corsOptions = {
  Origin: "['http://localhost:3000, 'https://mymember.com']",
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

app.use("/api", TTL);

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", stripeRoutes);
app.use("/api", categoryRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);
app.use("/api", programRoutes);
app.use("/api", manageRankRoutes);
app.use("/api", studentINfoRank);
app.use("/api", candidate);
app.use("/api", candidate_stripe);
app.use("/api", adminstrate);
app.use("/api", todo_api);
app.use("/api", Tasks);
app.use("/api", taskFolder);
app.use("/api", taskSubFolder);
app.use("/api", Goals);
app.use("/api", goalsFolder);
app.use("/api", goalsSubFolder);
app.use("/api", goals_api);
app.use("/api", class_schedule);
app.use("/api", attendence);
app.use("/api", campaign_type);
app.use("/api", organization_setup);
app.use("/api", category_manag);
app.use("/api", expense);
app.use("/api", appointment);
app.use("/api", events);
app.use("/api", add_member);
app.use("/api", pcategory);
app.use("/api", psubcategory);
app.use("/api", add_membership);
app.use("/api", finance_info);
app.use("/api", finance);
app.use("/api", bymember_ship);
app.use("/api", withdraw_funds);
app.use("/api", family_member);
app.use("/api", my_group);
app.use("/api", camp);
app.use("/api", product);
app.use("/api", test_purchase);
app.use("/api", test);
app.use("/api", expences_category);
app.use("/api", support);
app.use("/api", administrate_user);
app.use("/api", student_appoinment);
app.use("/api", birthday_appoinment);
app.use("/api", renewal_notes);
app.use("/api", birthday_notes);
app.use("/api", followup_notes_router);
app.use("/api", birthday_checklist);
app.use("/api", misucall_appoinment);
app.use("/api", misucall_notes);
app.use("/api", all_appoinment);
app.use("/api", email_system);
app.use("/api", email_compose);
app.use("/api", email_nurturing);
app.use("/api", email_library);
app.use("/api", goal_settings);
app.use("/api", email_system_folder);
app.use("/api", email_compose_folder);
app.use("/api", email_nurturing_folder);
app.use("/api", system_template);
app.use("/api", compose_template);
app.use("/api", nurturing_template);
app.use("/api", library_template);
app.use("/api", email_library_folder);
app.use("/api", leads_tracking);
app.use("/api", after_camp);
app.use("/api", userSectionFiles);
app.use("/api", summer_camp);
app.use("/api", speciality_program1);
app.use("/api", speciality_program2);
app.use("/api", productFolder);
app.use("/api", smartlistFolder);
app.use("/api", smartlists);
app.use("/api", buy_product);
// Docu Sign
app.use("/api", signStates);
// Appointment Event
app.use("/api", appointmentEvent);
// app.use('/api',emailSystem)
app.use("/api", text_sms);
app.use("/api", text_genral);
app.use("/api", text_genral_folder);
app.use("/api", text_nurturing);
app.use("/api", text_nurturing_folder);
app.use("/api", text_nurturing_template);
app.use("/api", text_Library);
app.use("/api", text_Library_Folder);
app.use("/api", document_folder);
app.use("/api", document_subFolder);
app.use("/api", upload_doc);
app.use("/api", textTemplateRoutes);
app.use("/api", textChatRoutes);
app.use("/api", chatbotUsersRoutes);
app.use("/api", finance_list);
app.use("/api", student_email);
app.use("/api", student_text);
app.use("/api", tutorial);
app.use("/api", tutFolder);
app.use("/api", tutSubFolder);

//stripePaymentGateway
app.use("/api", stripePaymentGateway);
//admin middleware
app.use("/api", location);
app.use("/api", sample_doc);
app.use("/api", statictics);
app.use("/api", purchaseMembership);
app.use("/api", manage_user);
app.use("/api", admin_email_system_cat);
app.use("/api", admin_email_compose_cat);
app.use("/api", admin_email_nurturing_cat);
app.use("/api", admin_email_system_folder);
app.use("/api", admin_email_compose_folder);
app.use("/api", admin_email_nurturing_folder);
app.use("/api", admin_email_system_template);
app.use("/api", admin_email_compose_template);
app.use("/api", admin_email_nurturing_template);
app.use("/api", admin_membership);
app.use("/api", admin_membershipFolder);
app.use("/api", admin_product);
app.use("/api", admin_productFolder);
app.use("/api", admin_program);
app.use("/api", admin_programCategory);
app.use("/api", admin_programRanks);
app.use("/api", admin_candidate);
app.use("/api", admin_candidateStripes);
app.use("/api", admin_document_folder);
app.use("/api", admin_document_subFolder);
app.use("/api", admin_upload_doc);
app.use("/api", admin_smartlists);
app.use("/api", admin_smartlistFolder);
app.use("/api", admin_leads_tracking);
app.use("/api", admin_after_camp);
app.use("/api", admin_expense_category);
app.use("/api", admin_tutorial);
app.use("/api", admin_tutFolder);
app.use("/api", admin_tutsubFolder);
app.use("/api", admin_text_template);
app.use("/api", admin_appointment_cat);
app.use("/api", admin_support);

// permission sub users
app.use("/api", permission_of_sub_users);

// school auth key middleware
app.use("/api", emailKey);
app.use("/api", textkey);
app.use("/api", recomendedForTestRoutes);
app.use("/api", registeredForTestRoutes);
app.use("/api", recommendedCandidatesRoutes);
app.use("/api", membershipFolderRoute);
app.use("/api", Dashboard);
//
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);
// menu middle
app.use("/api", student_menu);

//form builder routes
app.use("/api/forms", builderRoutes)
app.use('/builder/view', viewFormRoutes)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "template"));

// const privateKey1 = fs.readFileSync('/etc/letsencrypt/live/mymember.com/privkey.pem', 'utf8');
// const certificate1 = fs.readFileSync('/etc/letsencrypt/live/mymember.com/cert.pem', 'utf8');
// const ca1 = fs.readFileSync('/etc/letsencrypt/live/mymember.com/chain.pem', 'utf8');

// const credentials1 = {
// 	key: privateKey1,
// 	cert: certificate1,
// 	ca: ca1
// };

// app.use(function (req, res, next){
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     next();
//   });

const port = process.env.PORT || 3001;

// var server = https.createServer(credentials1, app).listen(port, function(){
// });

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
