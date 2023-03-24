import {AnalyserResult} from "./AnalyserResult";
import {BaseDefinition} from "../definition";

export const supportedLanguages = [
  'Java',
  'Go'
]

export class Analyser {
  name: string

  constructor(name: string) {
    this.name = name;
  }
  async scan(definition: BaseDefinition): Promise<AnalyserResult> {
    throw new Error()
  }
}
