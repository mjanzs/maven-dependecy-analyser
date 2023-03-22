import {Github} from "../repo/github";
import {LangAnalyser} from "./LangAnalyser";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./java/depdendecy-analyser";
import {AnalyserResult, MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {DependabotAnalyser} from "./DependabotAnalyser";
import {TopicsAnalyser} from "./TopicsAnalyser";
import {AnalyserDefinition, Definition} from "../definition";
import {Analyser} from "./Analyser";

export class GithubAnalysis {
  github: Github

  constructor(apiKey) {
    this.github = new Github(apiKey);
  }

  async execute(definition: Definition, outDir: string): Promise<AnalyserResult[]> {
    const executions = definition.repos
        .map(repo => {
          return new AnalysersConfiguration(repo, outDir, definition)
        })
        .map(config => this.executeAnalysis(config))
    return await Promise.all(executions)
  }

  private async executeAnalysis({repo, org, analysers, outDir}): Promise<MultiAnalyserResult> {
    const repository = this.github.repo(org, repo)

    const results = analysers.map(a => this.executeAnalyser(repository, a, outDir));
    const allResults = await Promise.all(
        [new SingleAnalyserResult('repo', repo.name),
          ...results])

    return allResults.reduce(MultiAnalyserResult.reducer(), null);

  }

  private async executeAnalyser(repository, analyserDefinition, outDir): Promise<Analyser> {
    const analyser = ({
      "include-lang": new LangAnalyser(repository),
      "include-topics": new TopicsAnalyser(repository),
      "dependency-version": new JavaDependencyAnalyser(repository, outDir),
      "dependabot": new DependabotAnalyser(repository)
    })[analyserDefinition.type]

    return analyser.scan(analyserDefinition)
  }
}

class AnalysersConfiguration {
  repo: RepositoryMetadata
  outDir: string
  org: string
  analysers: AnalyserDefinition[]

  constructor(repo: string | RepositoryMetadata,
              outDir: string,
              analysisDefinition: Definition) {
    this.repo = this.resolveRepoMetadata(repo, analysisDefinition.pomFiles);
    this.outDir = outDir;
    this.org = analysisDefinition.org;
    this.analysers = analysisDefinition.analysers;
  }

  private resolveRepoMetadata(repo: string | RepositoryMetadata, pomFiles: string[]): RepositoryMetadata {
    if (typeof repo === 'string') {
      return {
        name: repo as string,
        pomFiles: pomFiles
      }
    } else {
      return repo as RepositoryMetadata
    }
  }
}

export type RepositoryMetadata = {
  name: string,
  pomFiles: string[]
}
