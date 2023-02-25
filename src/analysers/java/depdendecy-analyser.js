import {Analyser, AnalyserChain} from '../index.js'

export class DependencyAnalyser extends AnalyserChain {
  dependencies

  constructor(dependencies) {
    super();
    this.dependencies = dependencies
  }

  versions(artifacts) {
      return artifacts
          .map(artifact => this.dependencies.find(value => artifact.matching(value)) ?? "")
  }
}
