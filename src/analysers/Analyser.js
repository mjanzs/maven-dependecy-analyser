import {AnalyserResult} from "./AnalyserResult.js";

export const supportedLanguages = [
  'Java',
  'Go'
]

export class AnalysisReporter {
  repository
  language
}

export class Analyser {
  name

  constructor(name) {
    this.name = name;
  }
  async scan(definition) {
    throw new Error()
  }
}
