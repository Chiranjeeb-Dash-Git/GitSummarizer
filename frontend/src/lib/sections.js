import GithubSlugger from 'github-slugger';

const strip = (s) => s.replace(/[`*_]/g, '').trim();

export function extractSections(md) {
  const slugger = new GithubSlugger();
  const sections = [];
  let inFence = false;

  for (const line of md.split('\n')) {
    if (line.trimStart().startsWith('```')) { inFence = !inFence; }
    const m = !inFence && line.match(/^##\s+(.+)$/);
    if (m) {
      const title = strip(m[1]);
      sections.push({ id: slugger.slug(title), title, weight: 1 });
    } else if (sections.length) {
      sections.at(-1).weight += line.length + 1;
    }
  }
  return sections;
}

