const fs = require('fs');
const parse = require('csv-parse');
const { Parser } = require('json2csv');

function parseCSVFile(path) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', err => reject(err));
  });
}

function createCSVBuffer(objects) {
  const fields = Object.keys(objects[0] || {});
  const parser = new Parser({ fields });
  return Buffer.from(parser.parse(objects));
}

module.exports = { parseCSVFile, createCSVBuffer };
