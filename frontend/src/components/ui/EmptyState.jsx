import Button from './Button.jsx';
import { WipeLink } from '../effects/StrataWipe.jsx';

export default function EmptyState({ title, body, action }) {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-20 text-left md:px-10 xl:px-16">
      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-[50ch] text-muted">{body}</p>
      {action && (
        <div className="mt-7">
          {action.to ? (
            <WipeLink to={action.to}>
              <Button>{action.label}</Button>
            </WipeLink>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}

