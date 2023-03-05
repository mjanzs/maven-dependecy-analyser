#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import {throwError} from "./src/utils/index.js";
import * as csv from "./src/writer/csv/index.js";
import {Definition} from "./src/definition/index.js";
import * as io from "./src/utils/io.js";
import {GithubAnalysis} from "./src/analysers/Analysis.js";

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

const outDir = options['dir'] ?? throwError("dir cannot be null")
const apiKey = options['api-key'] ?? throwError("api-key cannot be null")
const definitions = (options['definition'] ?? throwError("definition cannot be null"))
  .split(",")

await (async function() {
  definitions.map(async location => {
    const d = await io.readJsonFile(location);
    const definition = new Definition(d)

    const results = await new GithubAnalysis(apiKey)
      .execute(definition, outDir)

    const headers = results.map(r => r.headers())
      .reduce((a, b) => (a.toString() === b.toString()) ? a : throwError("incorrect headers"))
    const values = results.map(r => r.values());

    if (definition.transpose) {
      await csv.writeTransposed(outDir, headers, values)
    } else {
      await csv.write(outDir, headers, values)
    }
  })
})()
