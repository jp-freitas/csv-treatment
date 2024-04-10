import { writeFile, readFile, existsSync, mkdirSync } from 'node:fs';
import { load } from 'cheerio';

import { connection } from './utils/connection.js';

/**
 * Defining the Group Concat Max Lenght
 */
const groupConcatMaxLength = 90000;
/**
 * Defining the MySQL Query
 */
const query = `SELECT DISTINCT 'Unimed Regional Sul Goiás' as SINGULAR, 'Clinica SELF' as UNIDADE, '175' AS PK_ORGANIZACAO, C.CODIGO AS ID_CONTATO, AH.protocolo AS ID_ATENDIMENTO, AH.DATA AS DATA_ATENDIMENTO, 'CRM' AS NOME_CONSELHO, F.NOME AS NOME_PROFISSIONAL, FC.UF_CONSELHO AS UF_CONSELHO, FC.REGISTRO_CONSELHO AS  NUMERO_CONSELHO, GROUP_CONCAT(CPD.descricao_resposta) AS SOAPS, '' AS CIAP1, '' AS CIAP2, '' AS CIAP3, '' AS CIAP4, '' AS CIAP5, '' AS CIAP6, '' AS SOAPO, '' AS SOAPA, '' AS CID1, '' AS CID2,'' AS CID3, '' AS CID4, '' AS DIAGNOSTICO, '' AS SOAPP, GROUP_CONCAT(RC.texto_receita) AS RECEITUARIO FROM mastersys_ciame.cliente C INNER JOIN mastersys_ciame.ato_hospitalar AH ON AH.cliente = C.codigo LEFT JOIN mastersys_ciame.funcionario F ON AH.profissional = F.CODIGO LEFT JOIN mastersys_ciame.funcionario_conselho FC ON FC.funcionario = F.CODIGO INNER JOIN mastersys_ciame.cliente_prontuario_anamnese CP ON CP.ato_hospitalar = AH.codigo LEFT JOIN mastersys_ciame.cliente_prontuario_anamnese_detalhe CPD ON CPD.cliente_prontuario_anamnese = CP.codigo LEFT JOIN mastersys_ciame.anamnese A ON CP.anamnese = A.codigo LEFT JOIN mastersys_ciame.anamnese_perguntas AP ON CPD.anamnese_perguntas = AP.codigo LEFT JOIN mastersys_ciame.anamnese_respostas AR ON CPD.anamnese_respostas = AR.codigo LEFT JOIN mastersys_ciame.cliente_prontuario_receita RC ON RC.ATO_HOSPITALAR = AH.CODIGO WHERE F.CODIGO = 1 AND AH.SITUACAO <> 'CANCELADO' AND AH.DATA >= '2023-11-01 00:00:00' GROUP BY C.CODIGO, AH.protocolo, AH.DATA, F.NOME, FC.UF_CONSELHO, FC.REGISTRO_CONSELHO;`;

connection().connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");

  /**
   * Performing a SESSION to increase the lenght of the group concat.
   */
  connection().query(
    `SET SESSION group_concat_max_len = ${groupConcatMaxLength};`,
    (err) => {
      if (err) throw err;

      console.log("Group concat max lenght increased!");
    }
  );

  /**
   * Performing the query to retrieve data from database.
   */
  connection().query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    console.log("Query results:", results);

    // Write results to a JSON file
    writeFile("query_results.json", JSON.stringify(results), (err) => {
      if (err) {
        console.error("Error writing to JSON file:", err);
        return;
      }
      console.log("Results saved to query_results.json");
    });

    /**
     * Function to convert the data retrieved from JSON into CSV
     * @param {*} data
     * @returns
     */
    function convertToCSV(data) {
      const headers = Object.keys(data[0]);
      const headerRow = headers.join("|") + "\n";
      const csvRows = data
        .map((row) => headers.map((header) => row[header]).join("|"))
        .join("\n");
      const csv = headerRow + csvRows;
      return csv;
    }

    readFile("./query_results.json", "utf-8", (err, data) => {
      if (err) throw err;
      let jsonData;
      /**
       * Parse the JSON data.
       */
      try {
        jsonData = JSON.parse(data);
      } catch (error) {
        if (error) throw error;
      }
      /**
       * Treat the SOAPS value removing all the HTML tags.
       */
      for (let key in jsonData) {
        const soapsValue = jsonData[key].SOAPS;
        const cleanedSoaps = load(soapsValue).text();
        jsonData[key].SOAPS = cleanedSoaps;
      }

      /**
       * Remove the blank spaces in SOAPS value.
       */
      for (let key in jsonData) {
        const soapsValue = String(jsonData[key].SOAPS);
        const removedSpaces = soapsValue.replace(/\s+/g, " ");
        jsonData[key].SOAPS = removedSpaces;
      }

      /**
       * Write the data again in the JSON file.
       */
      writeFile(
        `query_results.json`,
        JSON.stringify(jsonData, null, 2),
        "utf-8",
        (err) => {
          if (err) throw err;
          console.log("Treatment done!");
        }
      );

      /**
       * Read the JSON file to convert all the data into CSV.
       */
      readFile("./query_results.json", "utf-8", (err, data) => {
        if (err) throw err;
        const jsonData = JSON.parse(data);
        const csvData = convertToCSV(jsonData);
        /**
         * Write the CSV file using the data converted using the above function.
         */
        writeFile("data.csv", csvData, "utf-8", (err) => {
          if (err) throw err;
          console.log("CSV saved in data.csv file!");
        });
      });
    });
  });

  // Close the connection
  connection().end();
});
