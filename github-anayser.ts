// @ts-nocheck

import commandLineArgs from 'command-line-args';
import {throwError} from "./src/utils";
import * as csv from "./src/writer/csv";
import {Definition} from "./src/definition";
import * as io from "./src/utils/io";
import {GithubAnalysis} from "./src/analysers";

const optionDefinitions = [
  {
    name: 'api-key',
    type: String
  },
  {
    name: 'definition',
    type: String
  },
  {
    name: 'dir',
    type: String
  }
]

const options = commandLineArgs(optionDefinitions)

const outDir: string = options['dir'] ?? throwError("dir cannot be null")
const apiKey: string = options['api-key'] ?? throwError("api-key cannot be null")
const definitions: string = (options['definition'] ?? throwError("definition cannot be null"))
  .split(",")

await (async function() {
  definitions.map(async location => {
    const d = await io.readJsonFile(location);
    const definition = new Definition(d)

    const results = await new GithubAnalysis(apiKey)
      .execute(definition, outDir)

    const headers = Object.values(results.map(r => r.headers())
      .reduce((acc, value) => {
        value.forEach((item) => {
          acc[item.id] = item;
        })
        return acc
      }, {}))
    const values = results.map(r => r.values());

    if (definition.transpose) {
      await csv.writeTransposed(outDir, headers, values)
    } else {
      await csv.write(outDir, headers, values)
    }
  })
})()
