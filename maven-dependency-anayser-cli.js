#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { throwError } from "./src/utils/index.js";
import * as csv from "./src/writer/csv/index.js";
import {Maven} from "./src/analysers/java/maven/index.js";
import {Github} from "./src/repo/github/index.js";
import {Artifact} from "./src/analysers/java/maven/artifact.js";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./src/analysers/java/depdendecy-analyser.js";
import {MultiAnalyserResult, SingleAnalyserResult} from "./src/analysers/AnalyserResult.js";

const options = {
  'api-key': {
    type: 'string',
  },
  'artifact': {
    type: 'string',
  },
  'org': {
    type: 'string'
  },
  'repo': {
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

const outDir = args.values['dir'] ?? throwError("dir cannot be null");
const org = args.values['org'] ?? throwError("org cannot be null");
const apiKey = args.values['api-key'] ?? throwError("api-key cannot be null");
const repos = (args.values['repo'] ?? throwError("repos cannot be null"))
  .split(",");
const artifacts = (args.values['artifact'] ?? throwError("artifacts cannot be null"))
  .split(",")
  .map(Artifact.parseDependencyString);


(async function() {
  const github = new Github(apiKey);

  let counter = 0;

  const results = await (await Promise.all(repos.map(async repo => {
    console.log(`[start] ${repo}`)
    const repository = github.repo(org, repo)
    const pom = await repository.downloadRootPom(outDir)

    const dependencies = new Maven()
        .execMvnTree(pom, repo, outDir)
        .getDependencies()
    const matchedResults = new JavaDependencyAnalyser(dependencies)
        .scanForVersions(artifacts)

    const lang = await repository.resolveLanguage()

    const repoResult = new SingleAnalyserResult('repo', `${repo}`)
    const langResult = new SingleAnalyserResult('lang', `${lang}`)

    console.log(`[done ${++counter}/${repos.length}] ${repo}`)
    return new MultiAnalyserResult([
          repoResult.scan,
          langResult.scan,
          ...matchedResults.scans
        ], [
          repoResult,
          langResult,
          ...matchedResults
        ]);
  })))

  function first() {
    return () => true;
  }

  const headers = results.map(r => r.headers()).find(first());
  const values = results.map(r => r.values());
  await csv.write(outDir, headers, values)

  console.log();
})()
