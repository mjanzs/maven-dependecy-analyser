import {AnalyserResult} from "./AnalyserResult.js";

export const supportedLanguages = [
  'Java',
  'Go'
]

export class Analyser {
  name: string

  constructor(name: string) {
    this.name = name;
  }
  async scan(definition): Promise<AnalyserResult> {
    throw new Error()
  }
}
