const mongoose = require('mongoose');
const members = require('../models/addmember')
const Mailer = require("../helpers/Mailer");
const Template = require('../models/emailSentSave')
const smartlist = require("../models/smartlists");
const { filterSmartlist } = require('../controllers/smartlists')
// const {emailCronFucntionality}=require('../controllers/compose_template')

async function main() {
    const uri = process.env.DATABASE;
    const client = mongoose.connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 5, // Maintain up to 5 socket connections
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
    })

    // Connect to the MongoDB cluster
    await client
        .then(() => console.log('DB Connected'))
        .catch(er => console.log(er));


    const pipeline = [
        {
            '$match': {
                $or: [{ operationType: 'insert' }, { operationType: 'update' }],
                "updateDescription.updatedFields.current_rank_name": { $exists: true }

            }
        }
    ];
    await monitorListingsUsingEventEmitter(pipeline);
    // let data = await filterSmartlist({
    //     "studentType": ["Active Trial"],
    //     "program": ["Taekwondo"],
    //     email: ['parmeshwar20@navgurukul.org']
    // }, '606aea95a145ea2d26e0f1ab')
}

main().catch(console.error);

// function closeChangeStream(timeInMs = 60000, changeStream) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             console.log("Closing the change stream");
//             changeStream.close();
//             resolve();
//         }, timeInMs)
//     })
// };

async function monitorListingsUsingEventEmitter(pipeline = []) {


    const changeStream = await members.watch(pipeline, { fullDocument: "updateLookup" });
    changeStream.on('change', async (next) => {
        try {
            switch (next.operationType) {
                case 'insert':
                    console.log('an insert happened...', "uni_ID: ", next.fullDocument);
                    break;

                case 'update':
                    console.log('an update happened...');
                    const { fullDocument, updateDescription } = next;
                    let { current_rank_name, current_stripe, program, studentType } = updateDescription.updatedFields
                    let { userId, email } = fullDocument;
                    const adminScheduleMails = await adminScheduledMails()


                    let promise = []
                    adminScheduleMails.map(async (element) => {

                        if (element.smartLists.length) {

                            let smartData = await (smartlist.find({ _id: { $in: element.smartLists } }))
                            smartData.map(async (smartlist1) => {
                                let smartEmails = await filterSmartlist(smartlist1.criteria, userId)
                                if (smartEmails.length) {
                                    let [current_rank_name1] = smartlist1.criteria.current_rank_name ? smartlist1.criteria.current_rank_name : false
                                    if (JSON.stringify(smartEmails).includes(fullDocument._id.toString())) {
                                        if (current_rank_name1 == [current_rank_name]) {
                                            console.log(smartEmails, smartlist1._id)

                                            if (element.isPlaceHolders) {
                                                for (i in fullDocument) {
                                                    if (element.template.includes(i)) {
                                                        console.log(i, fullDocument[i])
                                                        temp = replace(element.template, i, fullDocument[i])
                                                    }
                                                }
                                                const emailData = new Mailer({
                                                    to: [fullDocument.email],
                                                    from: element.from,
                                                    subject: element.subject,
                                                    html: temp,
                                                    attachments: element.attachments
                                                });
                                                emailData.sendMail()
                                                    .then(resp => console.log('mail sended'))
                                                    .catch(err => console.log(err))
                                            }
                                            else {

                                                const emailData = new Mailer({
                                                    to: [fullDocument.email],
                                                    from: element.from,
                                                    subject: element.subject,
                                                    html: element.template,
                                                    attachments: element.attachments
                                                });

                                                emailData.sendMail()
                                                    .then(resp => console.log('mail sended'))
                                                    .catch(err => console.log(err))

                                            }
                                        }
                                    }
                                }
                                const promises = await Promise.all(promise)

                                //             console.log(smartlist1);
                                //             [current_rank_name1] = smartlist1.criteria.current_rank_name;
                                //             if (current_rank_name1 == [current_rank_name]) {
                                //                 console.log(current_rank_name1, [current_rank_name])

                                //                 smartlist1.criteria.email = [email];
                                //                 let smartEmails = await filterSmartlist(smartlist1.criteria, userId)
                                //                 if (element.isPlaceHolders) {
                                //                     for (i in fullDocument) {
                                //                         if (element.template.includes(i)) {
                                //                             temp = replace(element.template, i, fullDocument[i])
                                //                         }
                                //                     }
                                //                     const emailData = new Mailer({
                                //                         to: smartEmails,
                                //                         from: element.from,
                                //                         subject: element.subject,
                                //                         html: temp,
                                //                         attachments: element.attachments
                                //                     });
                                //                     emailData.sendMail()
                                //                         .then(resp => console.log('mail sended'))
                                //                         .catch(err => console.log(err))
                                // }

                                //             }


                            })
                        }
                    })
                // }
                // const smartId = await smartlist.find({ 'criteria.current_rank_name': [current_rank_name], userId: userId })
                // console.log(smartId)
                // const emailData = new Mailer({
                //     to: [Element["email"]],
                //     from: emailBody.from,
                //     subject: emailBody.subject,
                //     html: temp,
                //     attachments: emailBody.attachments
                //   });
                //   emailData.sendMail()
                //     break;

                // case 'delete':
                //     console.log('a delete happened...');
                //     break;

                // default:
                //     break;
            }
        }
        catch (err) {
            console.error(err)
        }

    });

    // Wait the given amount of time and then close the change stream
    // await closeChangeStream(timeInMs, changeStream);
}

function replace(strig, old_word, new_word) {
    return strig.replace(new RegExp(`{${old_word}}`, 'g'), new_word)

}

function adminScheduledMails() {
    return new Promise((resolve, reject) => {
        Template.find({ is_Sent: false, email_type: "scheduled", adminId: process.env.ADMINID })
            .exec((err, resp) => {
                if (err) {
                    reject(err)
                }
                resolve(resp)
            })
    })


}

// console.log(adminScheduledMails())