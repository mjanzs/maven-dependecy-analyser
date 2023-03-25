import * as f from "path";
import {Octokit} from "@octokit/rest";
import * as io from "../../utils/io";
import {supportedLanguages} from "../../analysers/Analyser";

export class Github {
  octokit: Octokit;

  constructor(apiKey: string) {
    this.octokit = new Octokit({
      auth: apiKey
    })
  }

  repo(owner: string, repo: string): Repository{
    return new Repository(this, owner, repo)
  }
}

export class Repository {
  github: Github
  owner: string
  repo: string

  constructor(github: Github, owner: string, repo: string) {
    this.github = github
    this.owner = owner
    this.repo = repo
  }

  mavenRepoRequests(): MavenContentRequests {
    return new MavenContentRequests(this)
  }

  repoRequests(): RepoRequests {
    return new RepoRequests(this)
  }

  dependabotRequests(): DependabotRequests {
    return new DependabotRequests(this)
  }
}

class RepoRequests {
  github: Github
  owner: string
  repo: string

  constructor(repository: Repository) {
    this.github = repository.github
    this.owner = repository.owner
    this.repo = repository.repo
  }

  async resolveLanguage(): Promise<string> {
    const languages = await this.listLanguages()
    const sorted = Object.entries(languages)
      .sort(([_, a], [__, b]) => a - b)
    const [top] = sorted
      .find(([key, value]) => supportedLanguages.indexOf(key) >= 0) ?? ["n/a"]
    return top as string
  }

  async listLanguages(): Promise<{ [k: string]: number }> {
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

  async listTopics() {
    const response = await this.github.octokit.rest.repos.getAllTopics({
      owner: this.owner,
      repo: this.repo
    })
    return response.data.names
  }
}

class MavenContentRequests {
  github: Github
  owner: string
  repo: string

  constructor(repository) {
    this.github = repository.github
    this.owner = repository.owner
    this.repo = repository.repo
  }

  async downloadPoms(outputDir: string, pomFiles: string[]): Promise<string> {
    const poms: string[] = await Promise.all(pomFiles.map(async (fileName) => {
        return this.downloadFile(outputDir, fileName)
      }))

    // todo handle zero pom
    return poms.find(value => f.dirname(value) === `${outputDir}/${this.repo}`) as string
  }

  async downloadFile(outputDir: string, fileName: string): Promise<string> {
    const path = f.parse(fileName)
    const downloadUrl = await this.getRootPomUrl(fileName)
    const destination = f.join(outputDir, this.repo, path.dir, path.base)
    io.mkdir(f.dirname(destination))
    return io.downloadFile(downloadUrl, destination)
  }

  async getRootPomUrl(path): Promise<string> {
    const response = await this.github.octokit.rest.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path
    })
    // @ts-ignore
    return response.data.download_url
  }

  async findFiles(name: string): Promise<string[]> {
    const response = await this.github.octokit.search.code({
      q: `filename:${name}+repo:${this.owner}/${this.repo}`
    })
    return await Promise.all(response.data.items.map((item) => {
      return item.path
    }))
  }
}

class DependabotRequests {
  github: Github
  owner: string
  repo: string

  constructor(repository) {
    this.github = repository.github
    this.owner = repository.owner
    this.repo = repository.repo
  }

  async securityAlerts() {
    const repo = this.repo
    const owner = this.owner

    try {
      const response = await this.github.octokit.rest.dependabot.listAlertsForRepo({
        owner,
        repo,
        per_page: 100
      })
      return response.data
        .filter((item) => item.state === 'open')
        .map((item) => {
          const cve = item.security_advisory.cve_id
          const dependency = item.security_vulnerability.package.name
          return {
            cve,
            dependency
          }
        })
    } catch (e) {
      switch (e.message) {
        case 'Dependabot alerts are not available for archived repositories.':
        case 'Dependabot alerts are disabled for this repository.':
          break
        default:
          console.warn(e)
      }
      return []
    }
  }
}
