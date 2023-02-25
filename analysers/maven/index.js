import {dir} from "../../utils/io.js";

import {execSync} from "child_process";
import fs from "fs";
import * as graphvizParse from "ts-graphviz/ast";
import * as github from '../../repo/github/index.js'

export async function getDependencies(artifacts, apiKey, owner, repo, outputDir) {
  try {
    const pom = await github.getPom(apiKey, owner, repo, outputDir)
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

function execMvnTree(pom, repo, outputDir) {
  const dependencyFile = "dependencies.dot";
  execSync(`mvn -f ${pom} dependency:tree -DoutputType=dot -DoutputFile=${dependencyFile}`)
  return dir(`${outputDir}/${repo}`) + "/" + "dependencies.dot"
}


export function parseDependencyFile(dependencyFile) {
  const content = fs.readFileSync(dependencyFile)
  const g = graphvizParse.parse(content.toString())
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

export function parseDependencyString(str) {
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
