import {Analyser, AnalyserChain} from '../index.js'
import {AnalyserResult} from "../result/AnalyserResult.js";
import {MultiAnalyserResult} from "../result/MultiAnalyserResult.js";
import {SingleAnalyserResult} from "../result/SingleAnalyserResult.js";

export class DependencyAnalyser extends AnalyserChain {
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
