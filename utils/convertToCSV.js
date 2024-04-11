/**
 * Function to convert the data retrieved from JSON into CSV
 * @param {*} data
 * @returns
*/
export function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const headerRow = headers.join("×") + "\n";
  const csvRows = data
    .map((row) => headers.map((header) => row[header]).join("×"))
    .join("\n");
  const csv = headerRow + csvRows;
  return csv;
}