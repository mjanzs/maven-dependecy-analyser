import {Analyser} from '../Analyser'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult";
import {Maven} from "./maven";
import {Artifact} from "./maven/artifact";
import {Repository} from "../../repo/github";
import {DependencyAnalyserDefinition} from "../../definition";

export class DependencyAnalyser extends Analyser {
  repository: Repository
  out: string

  constructor(repository: Repository, out: string) {
    super('dependency-version');
    this.repository = repository
    this.out = out
  }

  async scan(definition: DependencyAnalyserDefinition) {
    const requests = this.repository.mavenRepoRequests()
    const pomFiles = definition.poms ?? await requests.findFiles('pom.xml')
    const rootPom = await requests.downloadPoms(this.out, pomFiles)

    const dependencies = new Maven()
      .execMvnTree(rootPom, this.repository.repo, this.out)
      .getDependencies()

    const artifacts = definition.dependencies
      .map(value => Artifact.parseDependencyString(value));

    return this.scanForVersions(artifacts, dependencies)
  }

  scanForVersions(artifacts: Artifact[], dependencies: Artifact[]): AnalyserResult {
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
