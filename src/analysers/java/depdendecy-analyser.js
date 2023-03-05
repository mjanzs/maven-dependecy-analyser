import {Analyser} from '../Analyser.js'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult.js";
import {Maven} from "./maven/index.js";
import {Artifact} from "./maven/artifact.js";

export class DependencyAnalyser extends Analyser {
  repository
  out

  constructor(repository, out) {
    super('dependency-version');
    this.repository = repository
    this.out = out
  }

  async scan(definition) {
    const pom = await this.repository.downloadRootPom(this.out)

    const dependencies = new Maven()
      .execMvnTree(pom, this.repository.repo, this.out)
      .getDependencies()

    const artifacts = definition.dependencies
      .map(value => Artifact.parseDependencyString(value));

    return this.scanForVersions(artifacts, dependencies)
  }

  scanForVersions(artifacts, dependencies) {
      const results = artifacts.map(artifact => {
          const match = dependencies
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
