import {throwError} from "../../../utils";
import {dir} from "../../../utils/io";

import {execSync} from "node:child_process";
import * as fs from "node:fs";
import * as graphvizParse from "ts-graphviz/ast";
import {Artifact} from "./artifact";
import {DotASTNode} from "ts-graphviz/lib/ast";

export class Maven {

  execMvnTree(pom: string, repo: string, outputDir: string): Tree {
    const dependencyFile = "dependencies.dot";
    try {
      execSync(`mvn -f ${pom} dependency:tree -DoutputType=dot -DoutputFile=${dependencyFile}`)
    } catch (e) {
      console.warn(e.stdout.toString())
      throw new Error(e.message);
    }
    return new Tree(this.parseDependencyFile(
        dir(`${outputDir}/${repo}`) + "/" + "dependencies.dot"))
  }

  private parseDependencyFile(dependencyFile): DotASTNode {
    const content = fs.readFileSync(dependencyFile)
    const g = graphvizParse.parse(content.toString())
    return g
  }

}

class Tree {
  graph: DotASTNode

  constructor(graph: DotASTNode) {
    this.graph = graph
  }

  getDependencies(): Artifact[] {
    return this.flattenNodes(this.graph)
        .map(Artifact.parseDependencyString);
  }

  private flattenNodes(dependencyGraph: DotASTNode): string[] {
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
