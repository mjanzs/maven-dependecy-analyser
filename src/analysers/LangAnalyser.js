import {Analyser} from "./Analyser.js";
import {Maven} from "./java/maven/index.js";
import {SingleAnalyserResult} from "./AnalyserResult.js";

export class LangAnalyser extends Analyser {
  repository

  constructor(repository) {
    super()
    this.repository = repository
  }

  async scan(definition) {
    const lang = await this.repository.resolveLanguage()
    return new SingleAnalyserResult(definition.type, lang)
  }
}
