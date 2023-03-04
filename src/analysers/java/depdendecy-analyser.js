import {Analyser} from '../Analyser.js'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult.js";
import {Maven} from "./maven/index.js";
import {Artifact} from "./maven/artifact.js";

export class DependencyAnalyser extends Analyser {
  dependencies

  constructor(dependencies) {
    super();
    this.dependencies = dependencies
  }

  // todo
  static async repositoryAnalyser(repository, out) {
    const pom = await repository.downloadRootPom(out)

    const dependencies = new Maven()
      .execMvnTree(pom, repository.repo, out)
      .getDependencies()
    return new DependencyAnalyser(dependencies)
  }

  scan(definition) {
    return this.scanForVersions(definition.dependencies.map(value => Artifact.parseDependencyString(value)))
  }

  scanForVersions(artifacts) {
      const results = artifacts.map(artifact => {
          const match = this.dependencies
              .find(value => artifact.matching(value))
          const identifier = artifact.identifier()
          if (match) {
              return new SingleAnalyserResult(identifier, match.version)
          } else {
              return AnalyserResult.empty(identifier);
          }
      });
      return MultiAnalyserResult.fromSingleResults(results)
  }
}
