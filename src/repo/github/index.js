import {Octokit} from "@octokit/rest";
import * as io from "../../utils/io.js";
import {supportedLanguages} from "../../analysers/index.js";

export class Github {
  octokit;

  constructor(apiKey) {
    this.octokit = new Octokit({
      auth: apiKey
    })
  }

  repo(owner, repo) {
    return new Repository(this, owner, repo)
  }
}

class Repository {
  static pom = "pom.xml";

  github
  owner
  repo

  constructor(github, owner, repo) {
    this.github = github;
    this.owner = owner;
    this.repo = repo;
  }

  async downloadRootPom(outputDir) {
    const downloadUrl = await this.getRootPomUrl()

    const pomFile = io.dir(`${outputDir}/${this.repo}`) + "/" + Repository.pom;
    return await io.downloadFile(downloadUrl, pomFile)
  }

  async getRootPomUrl() {

    const response = await this.github.octokit.rest.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: Repository.pom
    })
    return response.data.download_url
  }

  async resolveLanguage() {
    const languages = await this.getLanguages()
    const sorted = Object.entries(languages)
        .sort(([_, a], [__, b]) => a > b)
    const [top, _] = sorted
        .find(([key, value]) => supportedLanguages.indexOf(key) >= 0) ?? top[0]
    return top
  }

  async getLanguages() {
    const response = await this.github.octokit.rest.repos.listLanguages({
      owner: this.owner,
      repo: this.repo
    })

    const total = Object.values(response.data)
        .reduce((partialSum, a) => partialSum + a, 0)
    return Object.fromEntries(
        Object.entries(response.data)
            .map(([k, v], i) => [k, v / total]))
  }
}
