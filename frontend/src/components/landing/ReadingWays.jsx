import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tabs from '../ui/Tabs.jsx';
import MarkdownView from '../markdown/MarkdownView.jsx';
import { KINDS } from '../../lib/constants.js';

const SAMPLE_COPY = {
  overview: {
    lead: 'What the project does, what you need before you start, and where in the code to look first.',
    md: `# Express: a small web framework for Node.js
## In one minute
Express helps you build web servers and APIs in JavaScript. It handles routing and requests so you can focus on what your app does.
## Before you start
- Node.js installed
- Basic JavaScript
## Where to look first
- \`lib/application.js\` creates the app
- \`lib/router/\` decides which code handles each URL`,
  },
  release_notes: {
    lead: 'Recent commits grouped by what they mean to you: what is new, what is better, and what was fixed.',
    md: `# Release notes: last 30 commits
## Highlights
Faster startup and a fix for sessions that expired too early.
## Fixed
- Sessions no longer end before their time (\`a3f9c21\`)
## Breaking changes
- Node 16 is no longer supported (\`d44c9be\`)`,
  },
  commit: {
    lead: 'A single change explained: what moved, why it likely matters, and what a reviewer should check.',
    md: `# Faster dashboards for long histories
## What changed
An index now covers user and creation time on the history table.
## Risk and review notes
Low risk. Check that the migration runs on large tables without locking writes.`,
  },
};

export default function ReadingWays() {
  const [kind, setKind] = useState('overview');
  const active = SAMPLE_COPY[kind] || SAMPLE_COPY.overview;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 xl:px-16">
      <h2 className="font-display text-h1 font-extrabold tracking-tight">Three ways to read a repository</h2>
      <div className="mt-8">
        <Tabs tabs={KINDS} value={kind} onChange={setKind} label="Reading ways" />
      </div>

      <div
        role="tabpanel"
        id={`panel-${kind}`}
        aria-labelledby={`tab-${kind}`}
        className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1.9fr] lg:items-start"
      >
        <p className="text-lg leading-relaxed text-muted">{active.lead}</p>

        <div className="overflow-hidden rounded-slab border border-line-strong bg-surface p-6 shadow-stack sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={kind}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <MarkdownView source={active.md} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

