import {Analyser} from "./Analyser.js";
import {SingleAnalyserResult} from "./AnalyserResult.js";

export class TopicsAnalyser extends Analyser {
  repository

  constructor(repository) {
    super('topics');
    this.repository = repository
  }

  async scan(definition) {
    const topics = await this.repository.repoRequests().listTopics()
    let intersection = definition.topics.filter(x => topics.includes(x));
    return new SingleAnalyserResult(this.name, intersection.join('|'))
  }
}
