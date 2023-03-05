import {Analyser} from "./Analyser.js";
import {Maven} from "./java/maven/index.js";
import {SingleAnalyserResult} from "./AnalyserResult.js";

export class LangAnalyser extends Analyser {
  repository

  constructor(repository) {
    super('lang')
    this.repository = repository
  }

  async scan(definition) {
    const lang = await this.repository.repoRequests().resolveLanguage()
    return new SingleAnalyserResult(this.name, lang)
  }

}
