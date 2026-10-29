export default function StrataMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="5" width="24" height="5" rx="1.5" fill="var(--strata-1)" />
      <rect x="7" y="12" width="21" height="5" rx="1.5" fill="var(--strata-2)" />
      <rect x="4" y="19" width="18" height="5" rx="1.5" fill="var(--strata-3)" />
      <rect x="9" y="26" width="19" height="3" rx="1.5" fill="var(--strata-4)" />
    </svg>
  );
}

