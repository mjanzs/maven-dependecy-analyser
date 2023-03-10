import {throwError} from "../../../utils/index.js";
import {dir} from "../../../utils/io.js";

import {execSync} from "node:child_process";
import * as fs from "node:fs";
import * as graphvizParse from "ts-graphviz/ast";
import { Artifact } from "./artifact.js";

export class Maven {

  execMvnTree(pom, repo, outputDir) {
    const dependencyFile = "dependencies.dot";
    try {
      execSync(`mvn -f ${pom} dependency:tree -DoutputType=dot -DoutputFile=${dependencyFile}`)
    } catch (e) {
      console.warn(e.stdout.toString())
      throw new Error(e.message);
    }
    return new Tree(this.#parseDependencyFile(
        dir(`${outputDir}/${repo}`) + "/" + "dependencies.dot"))
  }

  #parseDependencyFile(dependencyFile) {
    const content = fs.readFileSync(dependencyFile)
    const g = graphvizParse.parse(content.toString())
    return g
  }

}

class Tree {
  #graph;

  constructor(graph) {
    this.#graph = graph
  }

  getDependencies(): Artifact[] {
    return this.flattenNodes(this.#graph)
        .map(Artifact.parseDependencyString);
  }

  private flattenNodes(dependencyGraph): string[] {
    const graph = dependencyGraph.children
        .filter(item => item.type === 'Graph')[0]

    return Object.keys(this.traverseNode(graph)
        .reduce((map, val) => {
          map[val] = val;
          return map;
        }, {}))
  }

  private traverseNode(node): string[] {
    return node.children
        .flatMap(edge => this.traverseEdge(edge))
  }

  private traverseEdge(edge): string[] {
    edge.type === 'Edge' ?? throwError("not edge")
    return edge.targets
        .map(target => this.parseNodeRef(target))
  }

  private parseNodeRef(nodeRef): string {
    nodeRef.type === 'NodeRef' ?? throwError("not node ref")
    return nodeRef.id.value;
  }
}
