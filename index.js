import { createInterface } from 'node:readline';
import { queryDoctor, queryDataByDoctor } from './utils/databaseOperations.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

let selectedDatabase;
let doctorName;
let loading = false
let doctors;
let selectedDoctor;

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    })
  });
}

async function main() {
  selectedDatabase = await askQuestion('Which database do you want to connect to?\n');
  doctorName = await askQuestion('Which doctor’s data do you want to retrieve?\n');
  const doctorQuery = `SELECT F.CODIGO, F.NOME FROM ${selectedDatabase}.funcionario F WHERE F.cbo IS NOT NULL AND F.NOME LIKE "%${doctorName}%";`;
  doctors = await queryDoctor(doctorQuery, selectedDatabase);
  let selectDoctor = `Which doctor do you want to select?\n`;
  for (let i = 0; i < doctors.length; i++) {
    selectDoctor += `${doctors[i].CODIGO} = ${doctors[i].NOME}\n`;
  };
  selectedDoctor = await askQuestion(selectDoctor);
  const medicalRecordQuery = `SELECT DISTINCT 'Unimed Regional Sul Goiás' as SINGULAR, 'Clinica' as UNIDADE, '175' AS PK_ORGANIZACAO, C.CODIGO AS ID_CONTATO, AH.protocolo AS ID_ATENDIMENTO, AH.data AS DATA_ATENDIMENTO, 'CRM' AS NOME_CONSELHO, F.NOME AS NOME_PROFISSIONAL, FC.UF_CONSELHO AS UF_CONSELHO, FC.REGISTRO_CONSELHO AS  NUMERO_CONSELHO, GROUP_CONCAT(CPD.descricao_resposta) AS SOAPS, '' AS CIAP1, '' AS CIAP2, '' AS CIAP3, '' AS CIAP4, '' AS CIAP5, '' AS CIAP6, '' AS SOAPO, '' AS SOAPA, '' AS CID1, '' AS CID2,'' AS CID3, '' AS CID4, '' AS DIAGNOSTICO, '' AS SOAPP, GROUP_CONCAT(RC.texto_receita) AS RECEITUARIO FROM ${selectedDatabase}.cliente C INNER JOIN ${selectedDatabase}.ato_hospitalar AH ON AH.cliente = C.codigo LEFT JOIN ${selectedDatabase}.funcionario F ON AH.profissional = F.CODIGO LEFT JOIN ${selectedDatabase}.funcionario_conselho FC ON FC.funcionario = F.CODIGO INNER JOIN ${selectedDatabase}.cliente_prontuario_anamnese CP ON CP.ato_hospitalar = AH.codigo LEFT JOIN ${selectedDatabase}.cliente_prontuario_anamnese_detalhe CPD ON CPD.cliente_prontuario_anamnese = CP.codigo LEFT JOIN ${selectedDatabase}.anamnese A ON CP.anamnese = A.codigo LEFT JOIN ${selectedDatabase}.anamnese_perguntas AP ON CPD.anamnese_perguntas = AP.codigo LEFT JOIN ${selectedDatabase}.anamnese_respostas AR ON CPD.anamnese_respostas = AR.codigo LEFT JOIN ${selectedDatabase}.cliente_prontuario_receita RC ON RC.ATO_HOSPITALAR = AH.CODIGO WHERE F.CODIGO = ${selectedDoctor} AND AH.SITUACAO <> 'CANCELADO' GROUP BY C.CODIGO, AH.protocolo, AH.DATA, F.NOME, FC.UF_CONSELHO, FC.REGISTRO_CONSELHO;`;
  rl.close();
  await queryDataByDoctor(medicalRecordQuery, selectedDatabase, doctorName);
  return;
}

main();