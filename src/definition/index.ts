export type RootDefinition = {
  org: string
  repos: string[]
  analysers: AnalyserDefinition[]
  transpose: boolean
}

export type AnalyserDefinition =
  | LangAnalyserDefinition
  | DependencyAnalyserDefinition
  | DependabotAnalyserDefinition
  | TopicsAnalyserDefinition

export type BaseDefinition = {
  type: string
  org: string
  repo: string
}

export type LangAnalyserDefinition = BaseDefinition;

export type DependencyAnalyserDefinition = BaseDefinition & {
  poms: string[],
  dependencies: string[]
}

export type DependabotAnalyserDefinition = BaseDefinition & {
  includeCount: boolean;
}

export type TopicsAnalyserDefinition = BaseDefinition & {
  topics: string[]
}
