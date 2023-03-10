import {Analyser} from "./Analyser";
import {SingleAnalyserResult} from "./AnalyserResult";
import {Repository} from "../repo/github";

export class TopicsAnalyser extends Analyser {
  repository: Repository

  constructor(repository) {
    super('topics');
    this.repository = repository
  }

  async scan(definition) {
    const topics = await this.repository.repoRequests().listTopics()
    let intersection = definition.topics.filter(x => topics.includes(x));
    return new SingleAnalyserResult(this.name, intersection.join(','))
  }
}
