import { connection } from './connection.js';
import { jsonDataFromDatabase, treatDataAndSaveInCSV } from './fileOperations.js';

export function showDatabases(query) {
  return new Promise((resolve, reject) => {
    connection().query(
      query,
      (err, databases) => {
        if (err) {
          reject(err);
        }
        resolve(databases)
      }
    );
  });
}

export function queryDoctor(query, selectedDatabase) {
  return new Promise((resolve, reject) => {
    connection(selectedDatabase).query(
      query,
      (err, doctors) => {
        if (err) {
          reject(err);
        }
        resolve(doctors);
      }
    );
  });
}

export function queryDataByDoctor(query, selectedDatabase, doctorName) {
  return new Promise((resolve, reject) => {
    connection(selectedDatabase).query(
      `SET SESSION group_concat_max_len = 900000;`,
      (err) => {
        if (err) {
          console.error("Error setting group_concat_max_len:", err);
          reject(err);
          return;
        }
        console.log("Group concat max length increased!");

        /**
         * Performing the query to retrieve data from database.
         */
        connection(selectedDatabase).query(query, async (err, doctorMedicalRecord) => {
          if (err) {
            console.error("Error executing query:", err);
            reject(err);
            return;
          }
          console.log("Query results:", doctorMedicalRecord.length);
          await jsonDataFromDatabase(doctorMedicalRecord, selectedDatabase, doctorName);
          await treatDataAndSaveInCSV(doctorName, selectedDatabase);
          resolve(doctorMedicalRecord);
        });
        connection().end();
      }
    );
  });
}