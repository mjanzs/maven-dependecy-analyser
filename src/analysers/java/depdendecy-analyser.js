import {Analyser} from '../Analyser.js'
import {AnalyserResult,MultiAnalyserResult,SingleAnalyserResult} from "../AnalyserResult.js";

export class DependencyAnalyser extends Analyser {
  dependencies

  constructor(dependencies) {
    super();
    this.dependencies = dependencies
  }

  scanForVersions(artifacts) {
      const results = artifacts.map(artifact => {
          const match = this.dependencies
              .find(value => artifact.matching(value))
          const identifier = artifact.identifier()
          if (match) {
              return new SingleAnalyserResult(identifier, identifier, match.version)
          } else {
              return AnalyserResult.empty(identifier, identifier);
          }
      });
      return new MultiAnalyserResult(results)
  }
}
