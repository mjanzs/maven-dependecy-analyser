import {Analyser, AnalyserChain} from '../index.js'
import {AnalyserResult} from "../AnalyserResult.js";

export class DependencyAnalyser extends AnalyserChain {
  dependencies

  constructor(dependencies) {
    super();
    this.dependencies = dependencies
  }

  scanForVersions(artifacts) {
      return artifacts
          .map(artifact => {
            const match = this.dependencies
                .find(value => artifact.matching(value))
            if (match) {
                return new AnalyserResult(artifact.identifier(), match.version)
            } else {
              return AnalyserResult.empty();
            }
          })
          .reduce((acc, result, i) => {
              return {
                  ...acc,
                  ...result.asMap()
              }
          }, {})
  }
}
