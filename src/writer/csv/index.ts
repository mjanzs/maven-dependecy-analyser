import {createObjectCsvWriter, createArrayCsvWriter} from "csv-writer";

export function writeTransposed(dirName: string,
                                fileName: string,
                                headers: [{[k: string]: string}],
                                values: [{[k: string]: string}]) {

  const headersAsArray = headers.map(header => {
    return header.id
  })
  const valuesAsArrays = values.map(value => {
    return headers.map(header => {
      return value[header.id]
    })
  })

  function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

  const csvWriter = createArrayCsvWriter({
    path: `${dirName}/${fileName}`
  });
  csvWriter.writeRecords(transpose([headersAsArray, ...valuesAsArrays])).then(() => {
    console.log('...Done');
  });
}

export function write(dirName, fileName, header, values): Promise<any> {
  const csvWriter = createObjectCsvWriter({
    header,
    path: `${dirName}/${fileName}`
  });
  return csvWriter.writeRecords(values).then(() => {
    console.log('...Done');
  });
}
