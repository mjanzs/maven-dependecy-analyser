import {Github} from "../repo/github";
import {LangAnalyser} from "./LangAnalyser";
import {DependencyAnalyser as JavaDependencyAnalyser} from "./java/DepdendecyAnalyser";
import {AnalyserResult, EmptyResult, MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {DependabotAnalyser} from "./DependabotAnalyser";
import {TopicsAnalyser} from "./TopicsAnalyser";
import {AnalyserDefinition, RootDefinition} from "../definition";
import {Analyser} from "./Analyser";
import {throwError} from "../utils";

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
          } as AnalysisDefinition
        })
        .map((analysisDefinition) => {
          return analysisDefinition.analysers
            .map(value => {
              return {
                ...analysisDefinition,
                ...value
              }
            })
            .map(analyserDefinition => this.createAnalyserContext(analysisDefinition, analyserDefinition))
            .reduce(executor(), initValue(analysisDefinition.repo))
        })
    return await Promise.all(executions)
  }

  private createAnalyserContext(analysisDefinition: AnalysisDefinition, analyserDefinition: AnalyserDefinition): AnalyserContext {
    const {outDir} = analysisDefinition
    const {org, repo, type} = analyserDefinition
    const repository = this.github.repo(org, repo)

    return {
      analysisDefinition,
      analyserDefinition,
      analyser: ({
        "include-lang": new LangAnalyser(repository),
        "include-topics": new TopicsAnalyser(repository),
        "dependency-version": new JavaDependencyAnalyser(repository, outDir),
        "dependabot": new DependabotAnalyser(repository)
      })[type] ?? throwError(`unknown analyser ${type}`)
    }
  }
}

function executor() {
  return async (acc, context) => {
    async function executeAnalyser(partialResult: MultiAnalyserResult): Promise<AnalyserResult> {
      const {analyserDefinition, analyser} = context as AnalyserContext
      return analyser.conditional(partialResult).scan(analyserDefinition)
    }

    const result = await acc as MultiAnalyserResult
    const analyserResult = await executeAnalyser(result)

    switch (true) {
      case analyserResult instanceof EmptyResult: {
        return acc
      }
      case analyserResult instanceof SingleAnalyserResult: {
        const item = analyserResult as SingleAnalyserResult
        return new MultiAnalyserResult(
          [...result.scans, item.scan],
          [...result.results, item])
      }
      case analyserResult instanceof MultiAnalyserResult: {
        const item = analyserResult as MultiAnalyserResult
        return new MultiAnalyserResult(
          [...result.scans, ...item.scans],
          [...result.results, ...item.results])
      }
      default:
        throw new Error();
    }
  }
}

function initValue(repo: string) {
  return Promise.resolve(
    new MultiAnalyserResult(['repo'], [new SingleAnalyserResult('repo', repo)]))
}

export type AnalyserContext = {
  analysisDefinition: AnalysisDefinition
  analyserDefinition: AnalyserDefinition
  analyser: Analyser
}

export type AnalysisDefinition = {
  org: string
  repo: string
  outDir: string
  analysers: AnalyserDefinition[]
}
