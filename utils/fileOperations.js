import { writeFile, readFile } from 'node:fs';
import { load } from 'cheerio';
import { verifyDestinationPath } from './verifyDestinationPath.js';

/**
 * Function to write JSON data from the database to a file.
 * @param {Array} results - The data to be written to the file.
 */
export async function jsonDataFromDatabase(results, selectedDatabase, doctorName) {
  await verifyDestinationPath(selectedDatabase);
  writeFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, JSON.stringify(results), (err) => {
    if (err) {
      console.error('Error while writing to JSON file:', err);
        return;
      }
    console.log(`Results saved to the following location ./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`);
  });
}


export function treatDataAndSaveInCSV(doctorName) {
  readFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, 'utf-8', (err, data) => {
    if (err) throw err;
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      if (error) throw error;
    }
  
    for (let key in jsonData) {
      const dateValue = jsonData[key].DATA_ATENDIMENTO;
      const dateValueFormatted = new Date(dateValue).toLocaleDateString('pt-BR');
      jsonData[key].DATA_ATENDIMENTO = dateValueFormatted;
    }
    for (let key in jsonData) {
      const soapsValue = String(jsonData[key].SOAPS);
      const cleanedSoaps = load(soapsValue).text();
      jsonData[key].SOAPS = cleanedSoaps;
    }
    for (let key in jsonData) {
      const soapsValue = String(jsonData[key].SOAPS);
      const removedSoapsSpaces = soapsValue.replace(/\s+/g, " ");
      jsonData[key].SOAPS = removedSoapsSpaces;
    }
    for (let key in jsonData) {
      const receitValue = String(jsonData[key].RECEITUARIO);
      const removedReceitSpaces = receitValue.replace(/\s+/g, ' ');
      const receitPattern = removedReceitSpaces.split(',#');
      const receitUnique = [...new Set(receitPattern)]
      jsonData[key].RECEITUARIO = receitUnique.join(',#');
    }
    writeFile(
      `./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`,
      JSON.stringify(jsonData, null, 2),
      'utf-8',
      (err) => {
        if (err) throw err;
        console.log('Treatment completed!');
      }
    );
    readFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, 'utf-8', (err, data) => {
      if (err) throw err;
      const jsonData = JSON.parse(data);
      const csvData = convertToCSV(jsonData);
      writeFile(`./files/${selectedDatabase}/data_${doctorName.toLowerCase()}.csv`, csvData, 'utf-8', (err) => {
        if (err) throw err;
        console.log(`CSV saved in the ${selectDB}/data_${doctorName.toLowerCase()}.csv file!`);
      });
    });
  });
}