import {AnalyserResult, MultiAnalyserResult} from "./AnalyserResult";
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

  shouldRun(partialResult: MultiAnalyserResult): boolean {
    return true;
  }

  conditional(partialResult: MultiAnalyserResult): Analyser {
    const delegate = this
    return new class extends Analyser {
      async scan(definition: BaseDefinition): Promise<AnalyserResult> {
        if (delegate.shouldRun(partialResult)) {
          return delegate.scan(definition);
        } else {
          return AnalyserResult.empty(delegate.name, "-")
        }
      }
    }(this.name);
  }

  async scan(definition: BaseDefinition): Promise<AnalyserResult> {
    throw new Error()
  }
}
