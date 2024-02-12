const mysql = require('mysql');
const fs = require('fs');
const cheerio = require('cheerio');

/**
 * Creating the connection with the database
 */
const connection = mysql.createConnection({
    host: 'your_host',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

/**
 * Defining the Group Concat Max Lenght 
 */
const groupConcatMaxLength = 90000;
/**
 * Defining the MySQL Query
 */
const query = `SELECT DISTINCT 'Unimed Regional Sul Goiás' as SINGULAR, 'Clinica SELF' as UNIDADE, '175' AS PK_ORGANIZACAO, C.CODIGO AS ID_CONTATO, AH.protocolo AS ID_ATENDIMENTO, AH.DATA AS DATA_ATENDIMENTO, 'CRM' AS NOME_CONSELHO, F.NOME AS NOME_PROFISSIONAL, FC.UF_CONSELHO AS UF_CONSELHO, FC.REGISTRO_CONSELHO AS  NUMERO_CONSELHO, GROUP_CONCAT(CPD.descricao_resposta) AS SOAPS, '' AS CIAP1, '' AS CIAP2, '' AS CIAP3, '' AS CIAP4, '' AS CIAP5, '' AS CIAP6, '' AS SOAPO, '' AS SOAPA, '' AS CID1, '' AS CID2,'' AS CID3, '' AS CID4, '' AS DIAGNOSTICO, '' AS SOAPP, GROUP_CONCAT(RC.texto_receita) AS RECEITUARIO FROM mastersys_ciame.cliente C INNER JOIN mastersys_ciame.ato_hospitalar AH ON AH.cliente = C.codigo LEFT JOIN mastersys_ciame.funcionario F ON AH.profissional = F.CODIGO LEFT JOIN mastersys_ciame.funcionario_conselho FC ON FC.funcionario = F.CODIGO INNER JOIN mastersys_ciame.cliente_prontuario_anamnese CP ON CP.ato_hospitalar = AH.codigo LEFT JOIN mastersys_ciame.cliente_prontuario_anamnese_detalhe CPD ON CPD.cliente_prontuario_anamnese = CP.codigo LEFT JOIN mastersys_ciame.anamnese A ON CP.anamnese = A.codigo LEFT JOIN mastersys_ciame.anamnese_perguntas AP ON CPD.anamnese_perguntas = AP.codigo LEFT JOIN mastersys_ciame.anamnese_respostas AR ON CPD.anamnese_respostas = AR.codigo LEFT JOIN mastersys_ciame.cliente_prontuario_receita RC ON RC.ATO_HOSPITALAR = AH.CODIGO WHERE F.CODIGO = 1 AND AH.SITUACAO <> 'CANCELADO' AND AH.DATA >= '2023-11-01 00:00:00' GROUP BY C.CODIGO, AH.protocolo, AH.DATA, F.NOME, FC.UF_CONSELHO, FC.REGISTRO_CONSELHO;`


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');

    /**
     * Performing a SESSION to increase the lenght of the group concat.
     */
    connection.query(`SET SESSION group_concat_max_len = ${groupConcatMaxLength};`, (err) => {
      if (err) throw err;

      console.log('Group concat max lenght increased!');
    });

    /**
     * Performing the query to retrieve data from database.
     */
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.log('Query results:', results);

        // Write results to a JSON file
        fs.writeFile('query_results.json', JSON.stringify(results), (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
                return;
            }
            console.log('Results saved to query_results.json');
        });

        // Read the json file to treat the data
        
    });

    // Close the connection
    connection.end();
});

/**
 * Function to convert the data retrieved from JSON into CSV
 * @param {*} data 
 * @returns 
 */
function convertToCSV(data) {
    const csv = data.map(row => Object.values(row).join('|')).join('\n');
    return csv;
}


fs.readFile('./query_results.json', 'utf-8', (err, data) => {
    if (err) throw err;
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (error) {
        if (error) throw error; 
    }
    
    for (let key in jsonData) {
        const soapsValue = jsonData[key].SOAPS;
        const cleanedSoaps = cheerio.load(soapsValue).text();
        jsonData[key].SOAPS = cleanedSoaps;
    }

    fs.writeFile(`query_results.json`, JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {
        if (err) throw err;
        console.log('Treatment done!')
    })
});

// Take a JSON file and convert into csv file
fs.writeFile('data.csv', csvData, 'utf-8', (err) => {
    if (err) throw err;

    console.log('CSV saved in data.csv file!')
})