import { describe, expect, it } from 'vitest';
import { extractSections } from '../lib/sections.js';

describe('extractSections', () => {
  const md = '# Title\n## One\ntext\n```js\n## not a heading\n```\n## Two\nmore text here';
  it('finds h2 sections and ignores fenced code', () => {
    const s = extractSections(md);
    expect(s.map((x) => x.title)).toEqual(['One', 'Two']);
  });
  it('creates github-style ids and weights by length', () => {
    const s = extractSections('## Getting started\nabc\n## Getting started\nabcdef');
    expect(s.map((x) => x.id)).toEqual(['getting-started', 'getting-started-1']);
    expect(s[1].weight).toBeGreaterThan(s[0].weight - 5);
  });
});

