import {Analyser} from "./Analyser";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {Repository} from "../repo/github";

export class DependabotAnalyser extends Analyser {
  repository: Repository

  constructor(repository: Repository) {
    super('dependabot')
    this.repository = repository
  }

  async scan(definition) {
    const securityAlerts = await this.repository.dependabotRequests()
      .securityAlerts()
    const results = securityAlerts
    // @ts-ignore
      .map(alert => new SingleAnalyserResult(alert.dependency, alert.cve))
    return MultiAnalyserResult.fromSingleResults(results)
  }
}
