import {Analyser} from "./Analyser.js";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult.js";

export class DependabotAnalyser extends Analyser {
  repository

  constructor(repository) {
    super('dependabot')
    this.repository = repository
  }

  async scan(definition) {
    const securityAlerts = await this.repository.securityAlerts()
    const results = securityAlerts
      .map(alert => new SingleAnalyserResult(alert.dependency, alert.cve))
    return MultiAnalyserResult.fromSingleResults(results)
  }
}
