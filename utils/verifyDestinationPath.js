import { existsSync, mkdirSync } from 'node:fs';

export function verifyDestinationPath(selectedDatabase) {
  return new Promise((resolve, reject) => {
    const dirPath = `./files`;
    try {
      if (!existsSync(dirPath)) {
        console.log(`${dirPath} doesn't found.`);
        mkdirSync(`${dirPath}/${selectedDatabase}`, { recursive: true });
        console.log(`${dirPath} created.`);
      }
      resolve(`${dirPath}/${selectedDatabase}`);
    } catch (error) {
      reject(error);
    }
  });
}