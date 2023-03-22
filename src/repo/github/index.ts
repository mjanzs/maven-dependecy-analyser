import * as f from "path";
import {Octokit} from "@octokit/rest";
import * as io from "../../utils/io";
import {supportedLanguages} from "../../analysers/Analyser";
import {RepositoryMetadata} from "../../analysers";

export class Github {
  octokit: Octokit;

  constructor(apiKey) {
    this.octokit = new Octokit({
      auth: apiKey
    })
  }

  repo(owner, repo: RepositoryMetadata) {
    return new Repository(this, owner, repo)
  }
}

export class Repository {

  github: Github
  owner: string
  repo: string
  repositoryMetadata: RepositoryMetadata

  constructor(github: Github, owner: string, repositoryMetadata: RepositoryMetadata) {
    this.github = github;
    this.owner = owner;
    this.repositoryMetadata = repositoryMetadata;
    this.repo = repositoryMetadata.name;
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
    this.repo = repository.repositoryMetadata.name
  }


  async resolveLanguage(): Promise<string> {
    const languages = await this.listLanguages()
    const sorted = Object.entries(languages)
      .sort(([_, a], [__, b]) => a - b)
    const [top, _] = sorted
      .find(([key, value]) => supportedLanguages.indexOf(key) >= 0) ?? ["n/a", 0]
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
  repositoryMetadata: RepositoryMetadata

  constructor(repository) {
    this.github = repository.github
    this.owner = repository.owner
    this.repositoryMetadata = repository.repositoryMetadata
  }

  async downloadRootPoms(outputDir): Promise<string> {
    let poms: string[]
    if (!this.repositoryMetadata.pomFiles) {
      const response = await this.github.octokit.search.code({
        q: `filename:pom.xml+repo:${this.owner}/${this.repositoryMetadata.name}`
      })
      poms = await Promise.all(response.data.items.map((item) => {
        return new File(item.name, item.path)
      }).map(async (file) => {
        return this.downloadPom(outputDir, file)
      }))
    } else {
      poms = await Promise.all(this.repositoryMetadata.pomFiles.map(value => {
        return new File(f.basename(value), value)
      }).map(async (file) => {
        return this.downloadPom(outputDir, file)
      }))
    }

    // todo handle zero pom
    return poms.find(value => f.dirname(value) === `${outputDir}/${this.repositoryMetadata.name}`) as string
  }

  async downloadPom(outputDir: string, file: File): Promise<string> {
    const path = f.parse(file.path)
    const downloadUrl = await this.getRootPomUrl(file.path)
    const destination = f.join(outputDir, this.repositoryMetadata.name, path.dir, path.base)
    io.mkdir(f.dirname(destination))
    return io.downloadFile(downloadUrl, destination)
  }

  async getRootPomUrl(path): Promise<string> {
    const response = await this.github.octokit.rest.repos.getContent({
      owner: this.owner,
      repo: this.repositoryMetadata.name,
      path
    })
    // @ts-ignore
    return response.data.download_url
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

class File {
  name: string
  path: string

  constructor(name: string, path: string) {
    this.name = name
    this.path = path
  }
}
