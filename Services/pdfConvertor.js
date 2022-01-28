const libre = require('libreoffice-convert');

async function buffToPdf(file) {
    libre.convertAsync = require('util').promisify(libre.convert)
    const ext = '.pdf'
    let pdfBuf = await libre.convertAsync(file, ext, undefined);
    return pdfBuf;
}

module.exports = buffToPdf