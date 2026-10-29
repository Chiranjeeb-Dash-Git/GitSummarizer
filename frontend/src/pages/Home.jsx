import { useSearchParams } from 'react-router-dom';
import AnalyzerForm from '../components/analyzer/AnalyzerForm.jsx';
import SplitLines from '../components/effects/SplitLines.jsx';
import TranslationStack from '../components/landing/TranslationStack.jsx';
import ReadingWays from '../components/landing/ReadingWays.jsx';
import WhoItsFor from '../components/landing/WhoItsFor.jsx';
import Samples from '../components/landing/Samples.jsx';
import Faq from '../components/landing/Faq.jsx';

export default function Home() {
  const [params] = useSearchParams();
  const audience = ['learner', 'product', 'maintainer'].includes(params.get('audience')) ? params.get('audience') : undefined;

  return (
    <>
      <section className="mx-auto grid max-w-[1280px] gap-16 px-5 pb-28 pt-12 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:pt-24 xl:px-16">
        <div>
          <h1 className="font-display text-display font-extrabold">
            <SplitLines lines={['Read any repository', 'in plain language.']} />
          </h1>
          <p className="mt-7 max-w-[46ch] text-[1.2rem] leading-relaxed text-muted">
            Paste a GitHub link and get an overview, release notes, or a single commit explained for the way you work.
          </p>
          <div className="mt-11"><AnalyzerForm initial={{ audience }} /></div>
        </div>
        <div className="lg:pt-6"><TranslationStack /></div>
      </section>
      <ReadingWays />
      <WhoItsFor />
      <Samples />
      <Faq />
    </>
  );
}

