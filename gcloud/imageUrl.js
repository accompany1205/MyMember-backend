function clourUrl() {

    this.imageUrl = (file) => {
        const { Storage } = require("@google-cloud/storage");
        const path = require('path')
        const { v4: uuidv4 } = require('uuid');
        require("dotenv").config();
        const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, keyFilename: path.join(__dirname, "./mad-for-chicken-243518-28ef1834055d.json") });
        const bucket = storage.bucket(process.env.GCS_BUCKET);

        const newFileName = uuidv4() + "-" + file.originalname;
        const doc = bucket.file('All-Images/' + newFileName);

        const blogStream = doc.createWriteStream({ resumable: false });
        async function configureBucketCors() {
            await bucket.setCorsConfiguration([
                {
                    maxAgeSeconds,
                    method: ["GET","POST","HEAD"],
                    origin: ["https://mymember.com", "localhost"],
                    responseHeader: ["*"],
                },
            ]);

            console.log(`Bucket updated with a CORS config
                to allow ${method} requests from ${origin} sharing 
                ${responseHeader} responses across origins`);
        }

        configureBucketCors().catch(console.error);

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
