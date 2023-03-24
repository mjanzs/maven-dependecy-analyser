import {Github} from "../repo/github";
import {LangAnalyser} from "./LangAnalyser";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./java/depdendecy-analyser";
import {AnalyserResult, MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {DependabotAnalyser} from "./DependabotAnalyser";
import {TopicsAnalyser} from "./TopicsAnalyser";
import {Analyser} from "./Analyser";
import {AnalyserDefinition, RootDefinition} from "../definition";

export class GithubAnalysis {
  github: Github

  constructor(apiKey) {
    this.github = new Github(apiKey);
  }

  async execute(definition: RootDefinition, outDir: string): Promise<AnalyserResult[]> {
    const executions = definition.repos
        .map(repo => {
          return {
            repo,
            outDir,
            org: definition.org,
            analysers: definition.analysers
          } as AnalyserContext
        })
        .map(config => this.executeAnalysis(config))
    return await Promise.all(executions)
  }

  private async executeAnalysis({org, repo, outDir, analysers}): Promise<MultiAnalyserResult> {
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

export type AnalyserContext = {
  org: string
  repo: string
  outDir: string
  analysers: AnalyserDefinition[]
}
