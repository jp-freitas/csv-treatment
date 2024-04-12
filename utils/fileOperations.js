import { writeFile, readFile } from 'node:fs/promises';
import { load } from 'cheerio';

import { convertToCSV } from './convertToCSV.js';
import { verifyDestinationPath } from './verifyDestinationPath.js';

/**
 * Function to write JSON data from the database to a file.
 * @param {Array} results - The data to be written to the file.
 */
export async function jsonDataFromDatabase(results, selectedDatabase, doctorName) {
  await verifyDestinationPath(selectedDatabase);
  try {
    await writeFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, JSON.stringify(results));
    console.log(`Results saved to the following location ./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`);
  } catch (error) {
    console.error(`Error writing to ./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, error);
  }
}


export async function treatDataAndSaveInCSV(doctorName, selectedDatabase) {
  console.log(selectedDatabase, doctorName)
  try {
    const data = await readFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, 'utf-8');
    if (!data) {
        console.error(`JSON file is empty or does not contain data: ./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`);
        return;
    }
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return;
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

    await writeFile(`./files/${selectedDatabase}/query_${doctorName.toLowerCase()}.json`, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('Treatment completed!');

    const csvData = convertToCSV(jsonData);
    await writeFile(`./files/${selectedDatabase}/data_${doctorName.toLowerCase()}.csv`, csvData, 'utf-8');
    console.log(`CSV saved in the ./files/${selectedDatabase}/data_${doctorName.toLowerCase()}.csv file!`);
    return;
  } catch (error) {
    console.error('Error:', error);
  }
}