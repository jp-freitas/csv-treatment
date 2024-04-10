import "dotenv/config.js";
import mysql from 'mysql';

/**
 * Creating the connection with the database and
 * receive the database where selected.
 */
export function connection() { 
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: "mastersys_ciame",
  });
}