import { connection } from './connection.js';
import { jsonDataFromDatabase } from './fileOperations.js';

export function queryDoctor(query, selectedDatabase) {
  return new Promise((resolve, reject) => {
    connection(selectedDatabase).query(
      query,
      (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      }
    );
    // Close the connection
    connection(selectedDatabase).end();
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
        connection(selectedDatabase).query(query, (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            reject(err);
            return;
          }
          console.log("Query results:", results.length);
          jsonDataFromDatabase(results, selectedDatabase, doctorName);
          resolve(results);
          // Close the connection
          connection(selectedDatabase).end();
        });
      }
    );
  });
}