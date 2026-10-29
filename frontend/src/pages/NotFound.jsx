import Button from '../components/ui/Button.jsx';
import { WipeLink } from '../components/effects/StrataWipe.jsx';
import StrataBackdrop from '../components/effects/StrataBackdrop.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[78vh] max-w-[1280px] lg:grid-cols-2">
      <div className="flex items-center px-5 py-14 md:px-10 xl:px-16">
        <div>
          <h1 className="font-display text-h1 font-extrabold">That page is not here</h1>
          <p className="mt-3 text-muted">The link may be old or mistyped.</p>
          <div className="mt-8">
            <WipeLink to="/">
              <Button>Go to the home page</Button>
            </WipeLink>
          </div>
        </div>
      </div>

      <div className="relative hidden border-l border-line lg:block">
        <StrataBackdrop />
      </div>
    </div>
  );
}

