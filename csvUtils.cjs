require('dotenv').config();
const path1 = require('path');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse');
const { token } = process.env;
const  csv_path  = path1.join(__dirname, 'Book1.csv');

const studentData = {
    NAMES : [],
    STUDENT_ID : [],
    JOIN_DATE : [],
    REIGON : [],
    TYPE : [],
    DOB : [],
    DISCORD : [],
}

const data = [];

async function readDataFromCSV() {
  return new Promise((resolve, reject) => {
    const data = []
    fs.createReadStream(csv_path)
      .pipe(parse({ delimier: ',', columns: true, ltrim: true }))
      .on('data', function(row) {
        data.push(row);
      })
      .on('error', function(error) {
        console.error(error);
        reject(error)
      })
      .on('end', function() {
        console.log('finished');
        data.forEach((data1) => {
          if (!data1.DISCORD) {
            data1.DISCORD = '';
          }
        });
        resolve(data);
      });
  })
}

function writeDataToCSV(student_data) {
  const csv = student_data.map((row) => {
    return `${row.Name},${row.StudentID},${row['Join Date']},${row['Are you a domestic or international student?']},${row['Are you an Undergraduate or Graduate student?']},${row['Date of Birth (dd/mm/yyyy format)']},${row.DISCORD}`;
  }).join('\n');
  fs.writeFile('output.csv', csv, err => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
    console.log('CSV file written successfully.');
  });
}

module.exports = {
    data,
    readDataFromCSV,
    writeDataToCSV
};