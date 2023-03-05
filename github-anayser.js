#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { throwError } from "./src/utils/index.js";
import * as csv from "./src/writer/csv/index.js";
import {Maven} from "./src/analysers/java/maven/index.js";
import {Github} from "./src/repo/github/index.js";
import {Artifact} from "./src/analysers/java/maven/artifact.js";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./src/analysers/java/depdendecy-analyser.js";
import {MultiAnalyserResult, SingleAnalyserResult} from "./src/analysers/AnalyserResult.js";
import Definition from "./src/definition/index.js";
import * as io from "./src/utils/io.js";
import {LangAnalyser} from "./src/analysers/LangAnalyser.js";
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

let counter = 0;

(async function() {
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
