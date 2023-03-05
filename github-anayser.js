#!/usr/bin/env node

import {parseArgs} from 'node:util';
import {throwError} from "./src/utils/index.js";
import * as csv from "./src/writer/csv/index.js";
import {Definition} from "./src/definition/index.js";
import * as io from "./src/utils/io.js";
import {GithubAnalysis} from "./src/analysers/Analysis.js";

const options = {
  'api-key': {
    type: 'string',
  },
  'definition': {
    type: 'string',
  },
  'dir': {
    type: 'string',
  },
};

const args = parseArgs({
  options,
  args: process.argv.slice(2)
})

const outDir = args.values['dir'] ?? throwError("dir cannot be null")
const apiKey = args.values['api-key'] ?? throwError("api-key cannot be null")
const definitions = (args.values['definition'] ?? throwError("definition cannot be null"))
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
    await csv.write(outDir, headers, values)
  })
})()
