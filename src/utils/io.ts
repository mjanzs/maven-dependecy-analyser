import fs from "node:fs"
import https from "node:https"

export function mkdir(dirName): string {
  if (!fs.existsSync(dirName)){
    fs.mkdirSync(dirName, { recursive: true });
  }
  return dirName;
}

export function downloadFile(downloadUrl, fileName): Promise<string> {
  const file = fs.createWriteStream(fileName);
  return new Promise((resolve, reject) => {
    https.get(downloadUrl, function (response) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve(fileName)
      });
    })
  })
}

export function readJsonFile(location): {} {
  return JSON.parse(fs.readFileSync(location).toString());
}
