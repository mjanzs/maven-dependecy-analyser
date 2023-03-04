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

const github = new Github(apiKey);

let counter = 0;

(async function() {
  definitions.map(async location => {
    const d = await io.readJsonFile(location);
    const definition = new Definition(d)

    const org = definition.org
    const results = await Promise.all(definition.repos.map(async repo => {
        const repository = github.repo(org, repo)

        const allResults = (await Promise.all(definition.analysers.flatMap(async analyserDefinition => {
            switch (analyserDefinition.type) {
              case "lang":
                return new LangAnalyser(repository).scan(analyserDefinition)
              case "dependency-version":
                const analyser = await JavaDependencyAnalyser.repositoryAnalyser(repository, outDir);
                const scan = await analyser.scan(analyserDefinition)
                return scan.results
            }
          }))).flatMap(i => i)

        const repoResult = new SingleAnalyserResult('repo', repo)
        const results = new MultiAnalyserResult(allResults.map(r => r.scan), allResults)
        return new MultiAnalyserResult([
          repoResult.scan,
          ...results.scans
        ], [
          repoResult,
          ...results.results
        ]);
      })
    )

    function first() {
      return () => true;
    }

    const headers = results.map(r => r.headers()).find(first());
    const values = results.map(r => r.values());
    await csv.write(outDir, headers, values)
  })
})()
