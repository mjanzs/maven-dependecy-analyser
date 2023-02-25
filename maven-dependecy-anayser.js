#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { throwError } from "./utils/index.js";
import * as maven from "./analysers/maven/index.js";
import * as github from "./repo/github/index.js";
import * as csv from "./writer/csv/index.js";

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
const dirName = args.values['dir'] ?? throwError("dir cannot be null");
const org = args.values['org'] ?? throwError("org cannot be null");
const apiKey = args.values['api-key'] ?? throwError("api-key cannot be null");
const repos = (args.values['repo'] ?? throwError("repos cannot be null"))
  .split(",");
const artifacts = (args.values['artifact'] ?? throwError("artifacts cannot be null"))
  .split(",")
  .map(maven.parseDependencyString);


(async function main() {
  let counter = 0;
  const header = ['repo', 'lang'].concat(artifacts
    .map(artifact => `${artifact.groupId}:${artifact.artifactId}`))

  const values = await (await Promise.all(repos.map(async repo => {
    console.log(`[start] ${repo}`)
    const dependencies = await maven.getDependencies(artifacts, apiKey, org, repo, dirName)
    const lang = await github.resolveLanguage(apiKey, org, repo)
    const result = [`${repo}`, `${lang}`].concat(dependencies
      .map(dependency => `${dependency.version ?? ''}`))
    console.log(`[done ${++counter}/${repos.length}] ${repo}`)
    return result;
  })))

  csv.write(dirName, header, values)

  console.log();
})()
