import {Octokit} from "@octokit/rest";
import * as io from "../../utils/io.js";

export async function resolveLanguage(apiKey, owner, repo) {
  const octokit = new Octokit({
    auth: apiKey
  });

  async function getLanguages(owner, repo) {
    const response = await octokit.rest.repos.listLanguages({
      owner,
      repo
    })
    const total = Object.values(response.data).reduce((partialSum, a) => partialSum + a, 0)
    return Object.fromEntries(
      Object.entries(response.data)
        .map(([k, v], i) => [k, v / total]
        ))
  }

  const langs = await getLanguages(owner, repo)
  const top = Object.entries(langs).sort(([_, a], [__, b]) => a > b)
  const [lang, _] = top.find(([key, value]) => key === 'Java' || key === 'Go') ?? top[0]
  return lang
}

export async function getPom(apiKey, owner, repo, outputDir) {
  const octokit = new Octokit({
    auth: apiKey
  });

  const pom = "pom.xml";

  async function getPomLink(apiKey, owner, repo) {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: pom
    })
    return response.data.download_url
  }

  const downloadUrl = await getPomLink(apiKey, owner, repo)

  const pomFile = io.dir(`${outputDir}/${repo}`) + "/" + pom;
  return await io.downloadFile(downloadUrl, pomFile)
}
