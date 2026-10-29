export const toPublicRepo = (r) => ({
  id: r.id,
  owner: r.owner,
  name: r.name,
  fullName: `${r.owner}/${r.name}`,
  description: r.description,
  htmlUrl: r.html_url,
  avatarUrl: r.avatar_url,
  stars: r.stars,
  forks: r.forks,
  language: r.language,
  topics: r.topics,
  defaultBranch: r.default_branch,
  license: r.license,
  pushedAt: r.pushed_at,
});

export const toPublicSummary = (s, repoRow) => ({
  id: s.id,
  kind: s.kind,
  audience: s.audience,
  ref: s.ref,
  title: s.title,
  contentMd: s.content_md,
  provider: s.provider,
  model: s.model,
  createdAt: s.created_at,
  repository: toPublicRepo(repoRow),
});

export const toPublicUser = (u) => ({
  id: u.id,
  email: u.email,
  displayName: u.display_name,
  createdAt: u.created_at,
});

