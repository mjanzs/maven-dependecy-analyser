import {Analyser} from '../Analyser.js'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult.js";
import {Maven} from "./maven/index.js";
import {Artifact} from "./maven/artifact.js";
import {Repository} from "../../repo/github/index.js";

export class DependencyAnalyser extends Analyser {
  repository: Repository
  out: string

  constructor(repository: Repository, out: string) {
    super('dependency-version');
    this.repository = repository
    this.out = out
  }

  async scan(definition) {
    const requests = this.repository.mavenRepoRequests()
    const pom = await requests.downloadRootPom(this.out)

    const dependencies = new Maven()
      .execMvnTree(pom, this.repository.repo, this.out)
      .getDependencies()

    const artifacts = definition.dependencies
      .map(value => Artifact.parseDependencyString(value));

    return this.scanForVersions(artifacts, dependencies)
  }

  scanForVersions(artifacts: Artifact[], dependencies: Artifact[]) {
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
