import {Github} from "../repo/github/index.js";
import {LangAnalyser} from "./LangAnalyser.js";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./java/depdendecy-analyser.js";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult.js";
import {DependabotAnalyser} from "./DependabotAnalyser.js";
import {TopicsAnalyser} from "./TopicsAnalyser.js";

export class GithubAnalysis {
  github

  constructor(apiKey) {
    this.github = new Github(apiKey);
  }

  async execute(definition, outDir) {
    const analysersConfiguration = definition.repos.map(repo => {
      return {
        repo,
        outDir,
        'org': definition.org,
        'analysers': definition.analysers
      }
    })
    return await Promise.all(analysersConfiguration
      .map(c => this.#executeAnalysis(c)))
  }

  async #executeAnalysis({repo, org, analysers, outDir}) {
    const repository = this.github.repo(org, repo)

    const results = analysers.map(a => this.#executeAnalyser(repository, a, outDir));
    const allResults = await Promise.all([new SingleAnalyserResult('repo', repo), ...results])

    return allResults.reduce(MultiAnalyserResult.reducer(), null);

  }

  async #executeAnalyser(repository, analyserDefinition, outDir) {
    const analyser = ({
      "include-lang": new LangAnalyser(repository),
      "include-topics": new TopicsAnalyser(repository),
      "dependency-version": new JavaDependencyAnalyser(repository, outDir),
      "dependabot": new DependabotAnalyser(repository)
    })[analyserDefinition.type]

    return analyser.scan(analyserDefinition)
  }
}
