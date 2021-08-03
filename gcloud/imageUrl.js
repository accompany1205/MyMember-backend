function clourUrl(){
    
    this.imageUrl = (file) => {
        console.log(">>>>>>..",file);
        const { Storage } = require("@google-cloud/storage");
        const path = require('path')
        var uid = require("uuid");
        var uidv1 = uid.v1;
        require("dotenv").config();
        const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, keyFilename: path.join(__dirname, "./mad-for-chicken-243518-28ef1834055d.json")});
        // console.log("storage >>>>>>>",storage)
        const bucket = storage.bucket(process.env.GCS_BUCKET);
        // console.log(">>>>>>>>>>",bucket)

        const newFileName = uidv1() + "-" + file.originalname;
        console.log(">>>>>>>>>file",newFileName)
        const doc = bucket.file('All-Images/' + newFileName);
        console.log("doc>>>>>>>>>>>>>>",doc)

        const blogStream = doc.createWriteStream({ resumable: false });


        return new Promise((resolve, reject) => {
            blogStream.on("error", err => reject(err));
            blogStream.on("finish", () => {
                const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${doc.name}`
                resolve(publicUrl)
            });
            blogStream.end(file.buffer);
        })
    }
}

module.exports = new clourUrl()
