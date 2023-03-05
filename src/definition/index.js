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
  org
  repos
  analysers
  transpose = false

  constructor(map) {
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

class AnalyserDefinition {
  type

  static from(definition) {
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
  dependencies = []

  constructor(map) {
    super()
    init(this, map);
  }
}

class DependabotAnalyserDefinition extends AnalyserDefinition {

  constructor(map) {
    super()
    init(this, map);
  }
}

class TopicsAnalyserDefinition extends AnalyserDefinition {
  topics = []

  constructor(map) {
    super()
    init(this, map);
  }
}

function init(o, map) {
  for (let [key, value] of Object.entries(map)) {
    o[key] = value
  }
}
