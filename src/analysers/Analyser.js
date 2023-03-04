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

  scan(definition) {
    throw new Error()
  }
}
