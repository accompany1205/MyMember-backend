const pizzip = require("pizzip");
const fetch = require("node-fetch");
const Docxtemplater = require("docxtemplater");
const buffToPdf = require("./pdfConvertor");

async function mergeFiles(docBody, mergedInfo) {
    let response = await fetch(docBody);
    response = await response.buffer();
    const zip = new pizzip(response);
    const doc = new Docxtemplater(zip, { linebreaks: true });
    doc.render(mergedInfo);
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    let finalPDF = await buffToPdf(buf);
    let bufCount = Buffer.byteLength(finalPDF);
    let fileObj = {
      fieldname: "attach",
      originalname: "Test.pdf",
      encoding: "7bit",
      mimetype: "application/pdf",
      buffer: finalPDF,
      size: bufCount,
    };
    return fileObj;
  return {};
}

module.exports = mergeFiles;
