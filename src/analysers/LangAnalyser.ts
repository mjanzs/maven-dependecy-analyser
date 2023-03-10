import {Analyser} from "./Analyser";
import {AnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {Repository} from "../repo/github";

export class LangAnalyser extends Analyser {
  repository: Repository

  constructor(repository) {
    super('lang')
    this.repository = repository
  }

  async scan(definition): Promise<AnalyserResult> {
    const lang = await this.repository.repoRequests().resolveLanguage()
    return new SingleAnalyserResult(this.name, lang)
  }

}
