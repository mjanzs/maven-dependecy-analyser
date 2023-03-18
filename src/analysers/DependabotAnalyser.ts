import {Analyser} from "./Analyser";
import {MultiAnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {Repository} from "../repo/github";
import {DependabotAnalyserDefinition} from "../definition";

export class DependabotAnalyser extends Analyser {
  repository: Repository

  constructor(repository: Repository) {
    super('dependabot')
    this.repository = repository
  }

  async scan(definition: DependabotAnalyserDefinition) {
    const securityAlerts = await this.repository.dependabotRequests()
      .securityAlerts()
    const results: SingleAnalyserResult[] = securityAlerts
        // @ts-ignore
        .map(alert => new SingleAnalyserResult(alert.dependency, alert.cve))
    const output = this.mergeMultipleCvesOnSingleDependency(results)
    if (definition.includeCount) {
      return MultiAnalyserResult.fromSingleResults([
          this.count(results, 'CVEs'),
          this.count(output, 'packages'),
          ...output])
    } else {
      return MultiAnalyserResult.fromSingleResults(output)
    }
  }

  private mergeMultipleCvesOnSingleDependency(results: SingleAnalyserResult[]) {
    return Object.values(results.reduce((acc, currentValue) => {
      const val = acc[currentValue.scan]
      if (!val) {
        acc[currentValue.scan] = currentValue
      } else {
        acc[currentValue.scan] = new SingleAnalyserResult(currentValue.scan, `${val.result},${currentValue.result}`)
      }
      return acc
    }, {} as { [k: string]: SingleAnalyserResult }));
  }

  private count(results: SingleAnalyserResult[], description: string) {
    return new SingleAnalyserResult(`${this.name} (${description})` , `${results.length}`);
  }
}
