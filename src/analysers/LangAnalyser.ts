import {Analyser} from "./Analyser";
import {AnalyserResult, SingleAnalyserResult} from "./AnalyserResult";
import {Repository} from "../repo/github";

export class LangAnalyser extends Analyser {
  public static NAME = 'lang'

  repository: Repository

  constructor(repository: Repository) {
    super(LangAnalyser.NAME)
    this.repository = repository
  }

  async scan(definition): Promise<AnalyserResult> {
    const lang = await this.repository.repoRequests().resolveLanguage()
    return new SingleAnalyserResult(this.name, lang)
  }

}
