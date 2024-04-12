import { existsSync, mkdirSync } from 'node:fs';

export function verifyDestinationPath(selectedDatabase) {
  return new Promise((resolve, reject) => {
    const dirPath = `./files`;
    try {
      if (!existsSync(`${dirPath}/${selectedDatabase}`)) {
        console.log(`${dirPath}/${selectedDatabase} doesn't found.`);
        mkdirSync(`${dirPath}/${selectedDatabase}`, { recursive: true });
        console.log(`${dirPath}/${selectedDatabase} created.`);
      }
      resolve(`${dirPath}/${selectedDatabase}`);
    } catch (error) {
      reject(error);
    }
  });
}