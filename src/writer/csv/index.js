import {createObjectCsvWriter} from "csv-writer";

export function write(dirName, header, values) {
  const csvWriter = createObjectCsvWriter({
    header,
    path: `${dirName}/dependencies.csv`
  });
  csvWriter.writeRecords(values).then(() => {
    console.log('...Done');
  });
}
