import {Github} from "../repo/github";
import {LangAnalyser} from "./LangAnalyser";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./java/depdendecy-analyser";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {DependabotAnalyser} from "./DependabotAnalyser";
import {TopicsAnalyser} from "./TopicsAnalyser";
import {AnalyserDefinition, Definition} from "../definition";
import {Analyser} from "./Analyser";

export class GithubAnalysis {
  github: Github

  constructor(apiKey) {
    this.github = new Github(apiKey);
  }

  async execute(definition: Definition, outDir: string) {
    const executions = definition.repos
        .map(repo => {
          return new AnalysersConfiguration(repo, outDir, definition.org, definition.analysers)
        })
        .map(config => this.executeAnalysis(config))
    return await Promise.all(executions)
  }

  private async executeAnalysis({repo, org, analysers, outDir}) {
    const repository = this.github.repo(org, repo)

    const results = analysers.map(a => this.executeAnalyser(repository, a, outDir));
    const allResults = await Promise.all(
        [new SingleAnalyserResult('repo', repo),
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
  repo: string
  outDir: string
  org: string
  analysers: AnalyserDefinition[]

  constructor(repo: string,
              outDir: string,
              org: string,
              analysers: AnalyserDefinition[]) {
    this.repo = repo;
    this.outDir = outDir;
    this.org = org;
    this.analysers = analysers;
  }
}
