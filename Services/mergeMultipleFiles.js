const pizzip = require("pizzip");
const fetch = require("node-fetch");
const Docxtemplater = require("docxtemplater");
const buffToPdf = require("./pdfConvertor");

async function mergeMultipleFiles(docBody, mergedInfo) {
    let response = await fetch(docBody);
    response = await response.buffer();
    const zip = new pizzip(response);
    const doc = new Docxtemplater(zip, { linebreaks: true });
    doc.render(mergedInfo);
    let buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
  // let finalPDF = await     (buf);

  // return finalPDF;
    return buf;
  return {};
}

module.exports = mergeMultipleFiles;
