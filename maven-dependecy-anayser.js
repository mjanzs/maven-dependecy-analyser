#!/usr/bin/env node

import { parseArgs } from 'node:util';
import * as fs from 'fs';
import * as https from 'https';
import { Octokit } from '@octokit/rest';
// import { Digraph, Graph, Node, Edge, Subgraph, toDot } from 'ts-graphviz';
import { parse as graphvizParse } from 'ts-graphviz/ast';
import { createArrayCsvWriter } from 'csv-writer';

import { execSync } from 'child_process';

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
const dirName = args.values['dir'] ?? throwExpression("dir cannot be null");
const org = args.values['org'] ?? throwExpression("org cannot be null");
const apiKey = args.values['api-key'] ?? throwExpression("api-key cannot be null");
const repos = (args.values['repo'] ?? throwExpression("repos cannot be null")).split(",");
const artifacts = (args.values['artifact'] ?? throwExpression("artifacts cannot be null")).split(",").map(parseDependencyString);

const octokit = new Octokit({
  auth: apiKey
});

dir(dirName)

main();
async function main() {
  let counter = 0;
  const header = ['repo', 'lang'].concat(artifacts
    .map(artifact => `${artifact.groupId}:${artifact.artifactId}`))

  const csvWriter = createArrayCsvWriter({
    header,
    path: `${dirName}/dependencies.csv`
  });

  const values = await (await Promise.all(repos.map(async repo => {
    console.log(`[start] ${repo}`)
    const dependencies = await getDependencies(apiKey, org, repo, dirName)
    const lang = await resolveLanguage(apiKey, org, repo)
    const result = [`${repo}`, `${lang}`].concat(dependencies
      .map(dependency => `${dependency.version ?? ''}`))
    console.log(`[done ${++counter}/${repos.length}] ${repo}`)
    return result;
  })))

  csvWriter.writeRecords(values).then(() => {
    console.log('...Done');
  });

  console.log();
}

///// ///// ///// ///// ///// ///// /////
async function getDependencies(apiKey, owner, repo, outputDir) {
  try {
    const pom = await getPom(apiKey, owner, repo, outputDir)
    const dependencyFile = execMvnTree(pom, repo, outputDir)
    const dependencyGraph = parseDependencyFile(dependencyFile)
    const dependencies = flattenNodes(dependencyGraph)
      .map(parseDependencyString);
    return artifacts.map(artifact => dependencies.find(value => matching(artifact, value)) ?? "")
  } catch (e) {
    console.error(e)
    return artifacts.map(_ => "")
  }
}

async function getPom(apiKey, owner, repo, outputDir) {
  const pom = "pom.xml";
  async function getPomLink(apiKey, owner, repo) {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: pom
    })
    return response.data.download_url
  }

  const downloadUrl = await getPomLink(apiKey, owner, repo)

  const pomFile = dir(`${outputDir}/${repo}`) + "/" + pom;
  return await downloadFile(downloadUrl, pomFile)
}

async function resolveLanguage(apiKey, owner, repo) {
  const langs = await getLanguages(apiKey, owner, repo)
  const top = Object.entries(langs).sort(([_, a], [__, b]) => a > b)
  const [lang, _] = top.find(([key, value]) => key === 'Java' || key === 'Go') ?? top[0]
  return lang
}

async function getLanguages(apiKey, owner, repo) {
  const response = await octokit.rest.repos.listLanguages({
    owner,
    repo
  })
  const total = Object.values(response.data).reduce((partialSum, a) => partialSum + a, 0)
  return Object.fromEntries(
    Object.entries(response.data)
      .map(([k, v], i) => [k, v / total]
    ))
}

function execMvnTree(pom, repo, outputDir) {
  const dependencyFile = "dependencies.dot";
  execSync(`mvn -f ${pom} dependency:tree -DoutputType=dot -DoutputFile=${dependencyFile}`)
  return dir(`${outputDir}/${repo}`) + "/" + "dependencies.dot"
}

function downloadFile(downloadUrl, fileName) {
  const file = fs.createWriteStream(fileName);
  return new Promise((resolve, reject) => {
    https.get(downloadUrl, function(response) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve(fileName)
      });
    })
  })
}


function parseDependencyFile(dependencyFile) {
  const content = fs.readFileSync(dependencyFile)
  const g = graphvizParse(content.toString())
  return g
}

function flattenNodes(dependencyGraph) {
  const graph = dependencyGraph.children
    .filter(item => item.type === 'Graph')[0]

  return Object.keys(traverseNode(graph)
    .reduce((map, val) => {
      map[val] = val;
      return map;
    }, {})
  )
}

function traverseNode(node) {
  return node.children
    .flatMap(edge => traverseEdge(edge))
}

function traverseEdge(edge) {
  edge.type === 'Edge' ?? throwExpression("not edge")
  return edge.targets
    .map(target => parseNodeRef(target))
}

function parseNodeRef(nodeRef) {
  nodeRef.type === 'NodeRef' ?? throwExpression("not node ref")
  return nodeRef.id.value;
}

function parseDependencyString(str) {
  const regex = /([^:]+):([^:]+):?([^:]*):?([^:]*):?([^:]*)/;
  let [_,
    groupId,
    artifactId,
    type,
    version,
    scope] = regex.exec(str) || [];
  return {
    groupId,
    artifactId,
    type: type || undefined,
    version: version || undefined,
    scope: scope || undefined
  }
}

function matching(artifact, value) {
  return Object.entries(artifact)
    .filter(entry => !!entry[1])
    .map(entry => entry[0])
    .reduce((result, key) => result && artifact[key] === value[key], true)
}

function dir(dirName) {
  if (!fs.existsSync(dirName)){
   fs.mkdirSync(dirName, { recursive: true });
  }
  return dirName;
}

function throwExpression(errorMessage) {
  throw new Error(errorMessage);
}
