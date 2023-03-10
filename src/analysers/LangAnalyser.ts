import {Analyser} from "./Analyser.js";
import {AnalyserResult, SingleAnalyserResult} from "./AnalyserResult.js";
import {Repository} from "../repo/github/index.js";

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
