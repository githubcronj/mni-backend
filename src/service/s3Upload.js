const aws = require("aws-sdk");

aws.config.update({
    accessKeyId: "AKIAQ2G3PA55ZJNQZNNJ",
    secretAccessKey: "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",
    region: "ap-south-1"
});

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { 

        
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read", 
            Bucket: "gatedservices", 
            Key: "MakeNewIndia/"+ file.originalname,
            Body: file.buffer,
        };

        
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            //console.log(data)
            //console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location);
        });
    });
}

module.exports.uploadFile = uploadFile;