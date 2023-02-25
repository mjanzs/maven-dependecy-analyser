import fs from "fs";
import https from "https";

export function dir(dirName) {
  if (!fs.existsSync(dirName)){
    fs.mkdirSync(dirName, { recursive: true });
  }
  return dirName;
}

export function downloadFile(downloadUrl, fileName) {
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
