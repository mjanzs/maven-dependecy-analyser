import {Analyser} from '../Analyser.js'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult.js";

export class DependencyAnalyser extends Analyser {
  dependencies

  constructor(dependencies) {
    super();
    this.dependencies = dependencies
  }

  scanForVersions(artifacts) {
      return new MultiAnalyserResult(artifacts
          .map(artifact => {
            const match = this.dependencies
                .find(value => artifact.matching(value))
            if (match) {
                return new SingleAnalyserResult(artifact.identifier(), match.version)
            } else {
              return AnalyserResult.empty();
            }
          }))
  }
}
