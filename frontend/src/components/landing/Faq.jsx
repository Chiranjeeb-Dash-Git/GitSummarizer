import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ease } from '../../lib/motion.js';

const FAQS = [
  {
    q: 'Does it work with private repositories?',
    a: 'No. GitSummarizer reads public repositories only.',
  },
  {
    q: 'What is stored?',
    a: 'We store the generated summary and public details about the repository, plus your history and saves if you have an account. We do not store source code.',
  },
  {
    q: 'Where does the text go?',
    a: 'README text and commit data from the public repository are sent to an AI provider to write the summary.',
  },
  {
    q: 'How fresh is a summary?',
    a: 'Overviews and release notes are reused for up to 24 hours. A commit explanation never changes. Signed-in readers can refresh at any time.',
  },
  {
    q: 'Why does a commit summary say "likely"?',
    a: 'A commit shows what changed, not always why. The summary says so when it is inferring.',
  },
  {
    q: 'Can it be wrong?',
    a: 'Yes. It summarises what the repository shows. Check anything important in the source.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 xl:px-16">
      <h2 className="font-display text-h1 font-extrabold tracking-tight">Questions</h2>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q} className="py-4">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between gap-4 text-left font-display text-xl font-bold text-ink hover:text-malachite"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: ease.outExpo }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

