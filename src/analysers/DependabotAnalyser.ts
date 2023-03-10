import {Analyser} from "./Analyser";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";

export class DependabotAnalyser extends Analyser {
  repository

  constructor(repository) {
    super('dependabot')
    this.repository = repository
  }

  async scan(definition) {
    const securityAlerts = await this.repository.dependabotRequests()
      .securityAlerts()
    const results = securityAlerts
      .map(alert => new SingleAnalyserResult(alert.dependency, alert.cve))
    return MultiAnalyserResult.fromSingleResults(results)
  }
}
