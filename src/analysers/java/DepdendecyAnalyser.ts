import {Analyser} from '../Analyser'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult";
import {Maven} from "./maven";
import {Artifact} from "./maven/artifact";
import {Repository} from "../../repo/github";
import {DependencyAnalyserDefinition} from "../../definition";
import {LangAnalyser} from "../LangAnalyser";

export class DependencyAnalyser extends Analyser {
  repository: Repository
  out: string

  constructor(repository: Repository, out: string) {
    super('dependency-version');
    this.repository = repository
    this.out = out
  }

  shouldRun(partialResult: MultiAnalyserResult): boolean {
    return partialResult.results
      .filter(result => result.scan == LangAnalyser.NAME)
      .some(value => value.result == 'Java');
  }

  async scan(definition: DependencyAnalyserDefinition) {
    const rootPom = await this.resolvePoms(definition)

    const dependencies = new Maven()
      .execMvnTree(rootPom, this.repository.repo, this.out)
      .getDependencies()

    const artifacts = definition.dependencies
      .map(value => Artifact.parseDependencyString(value));

    return this.scanForVersions(artifacts, dependencies)
  }

  private async resolvePoms(definition: DependencyAnalyserDefinition): Promise<string> {
    if (definition.repo.projectLocation) {
      return `${definition.repo.projectLocation}/pom.xml`
    } else {
      const requests = this.repository.mavenRepoRequests()
      const pomFiles = definition.poms ?? await requests.findFiles('pom.xml')
      return requests.downloadPoms(this.out, pomFiles)
    }
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
