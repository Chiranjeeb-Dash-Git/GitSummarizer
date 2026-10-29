import Button from '../ui/Button.jsx';
import { WipeLink } from '../effects/StrataWipe.jsx';
import { ERROR_HELP } from '../../lib/constants.js';

export default function ErrorPanel({ error, onRetry }) {
  const code = error?.code ?? 'UNKNOWN';
  const message = error?.message ?? 'That did not work.';
  const details = error?.details;

  let title = 'That did not work';
  if (code === 'INVALID_URL') title = 'That link does not look right';
  else if (code === 'REPO_NOT_FOUND') title = 'We could not find that repository';
  else if (code === 'GITHUB_RATE_LIMITED') title = 'GitHub is limiting requests';
  else if (code === 'GUEST_LIMIT' || code === 'USER_LIMIT') title = 'You have reached the reading limit';
  else if (code === 'NETWORK') title = 'No connection';

  const help = ERROR_HELP[code];
  const isLimit = code === 'GUEST_LIMIT' || code === 'USER_LIMIT';
  const retryTime = details?.retryAt ? new Date(details.retryAt).toLocaleTimeString() : null;

  return (
    <div
      role="alert"
      className="relative overflow-hidden rounded-slab border border-line-strong bg-surface p-6 pl-8 shadow-stack sm:p-8 sm:pl-10"
    >
      <span className="absolute inset-y-0 left-0 w-2 bg-oxide" />
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-base text-ink">{message}</p>
      {help && <p className="mt-2 text-sm text-muted">{help}</p>}
      {retryTime && <p className="mt-2 text-sm text-muted">You can try again at {retryTime}.</p>}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {code === 'GUEST_LIMIT' ? (
          <>
            <WipeLink to="/register">
              <Button variant="primary">Create an account</Button>
            </WipeLink>
            <WipeLink to="/login">
              <Button variant="ghost">Sign in</Button>
            </WipeLink>
          </>
        ) : !isLimit && onRetry ? (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}

        <WipeLink to="/">
          <Button variant="quiet">Change the link</Button>
        </WipeLink>
      </div>
    </div>
  );
}

