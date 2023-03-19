/*
{
  "org": "spring-projects",
  "repos": [
    "spring-guice",
    "spring-data-redis"
  ],
  "analysers": [
    {
      "type": "lang"
    },
    {
      "type": "dependency-version",
      "dependencies": [
        "com.google.inject:guice",
        "asd:aaa",
        "redis.clients:jedis"
      ]
    }
  ]
}
 */

export class Definition {
  org: string
  repos: string[]
  analysers: AnalyserDefinition[]
  transpose: boolean = false
  output: string = "out.csv"


  constructor(map: {[k: string]: any}) {
    for (let [key, value] of Object.entries(map)) {
      switch (key) {
        case "analysers":
          this[key] = value.map(v => AnalyserDefinition.from(v))
          break
        default:
          this[key] = value
      }
    }
  }
}

export class AnalyserDefinition {
  type: string

  static from(definition): AnalyserDefinition {
    switch (definition.type) {
      case "include-lang":
        return new LangAnalyserDefinition(definition)
      case "dependency-version":
        return new DependencyVersionAnalyserDefinition(definition)
      case "dependabot":
        return new DependabotAnalyserDefinition(definition)
      case "include-topics":
        return new TopicsAnalyserDefinition(definition)
      default:
        throw new Error(definition.type)
    }
  }
}

class LangAnalyserDefinition extends AnalyserDefinition {
  constructor(map) {
    super()
    init(this, map)
  }
}

class DependencyVersionAnalyserDefinition extends AnalyserDefinition {
  dependencies: [string?] = []

  constructor(map) {
    super()
    init(this, map);
  }
}

export class DependabotAnalyserDefinition extends AnalyserDefinition {

  includeCount: boolean;

  constructor(map) {
    super()
    init(this, map);
  }
}

class TopicsAnalyserDefinition extends AnalyserDefinition {
  topics: [string?] = []

  constructor(map) {
    super()
    init(this, map);
  }
}

function init(o: any, map: {[k: string]: any}) {
  for (let [key, value] of Object.entries(map)) {
    o[key] = value
  }
}
