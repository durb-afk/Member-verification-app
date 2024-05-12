require('dotenv').config();
const path = require('path');
const fs = require('node:fs');
const fsAsync = require('node:fs/promises');
const { parse } = require('csv-parse');

// Path to the CSV file
const rawDataFilePath  = path.join(__dirname, 'input.csv');

// Path to the JSON file
const databaseFilePath  = path.join(__dirname, 'database.json');

async function readDataFromCSV(path) {
  const records = [];
  const parser = fs
    .createReadStream(path)
    .pipe(parse({ 
      delimier: ',', 
      columns: true, 
      ltrim: true 
    }));
  for await (const record of parser) {
    // Work with each record
    records.push(record);
    if (!record.DISCORD) {
      record.DISCORD = '';
    }
  }
  return records;
}

async function readDataFromJSON(path) {
  const string = await fsAsync.readFile(path, 'utf8');
  try {
    return JSON.parse(string);
  } catch (error) {
    console.error('Error while parsing JSON data:', err);
    return {};
  }
}

async function writeDataToJSON(studentData) {
  const data = JSON.stringify(studentData, null, 2);

  try {
    await fsAsync.writeFile(databaseFilePath, data);
    console.log('JSON data written successfully.');
  } catch (error) {
    console.error('Error writing to file:', err);
  }
}

module.exports = {
  rawDataFilePath,
  databaseFilePath,
  readDataFromCSV,
  readDataFromJSON,
  writeDataToJSON,
};