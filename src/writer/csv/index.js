import {createArrayCsvWriter} from "csv-writer";

export function write(dirName, header, values) {
  const csvWriter = createArrayCsvWriter({
    header,
    path: `${dirName}/dependencies.csv`
  });
  csvWriter.writeRecords(values).then(() => {
    console.log('...Done');
  });
}
