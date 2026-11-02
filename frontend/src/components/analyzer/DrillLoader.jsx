export default function DrillLoader({ stages, repository, cached }) {
  const activeStage = stages.find((s) => s.state === 'active') || stages[0];
  const doneCount = stages.filter((s) => s.state === 'done').length;
  const progressPercent = Math.min(100, Math.round((doneCount / Math.max(1, stages.length)) * 100));

  return (
    <div className="gitvision-loader mx-auto max-w-3xl pt-16 pb-24 text-center">
      <div className="nb bg-white p-8 text-left" style={{ boxShadow: '8px 8px 0 #0A0A0A' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="nb inline-block bg-[#FFD60A] px-3.5 py-1.5 font-mono text-sm font-bold text-[#0A0A0A]"
            style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
          >
            {repository?.fullName || 'ANALYZING REPOSITORY'}
          </p>
          <span className="font-mono text-xs font-bold text-[#5B5B52]">
            {cached ? 'CACHE RECALL' : 'LIVE PIPELINE'}
          </span>
        </div>

        {/* Thick progress bar */}
        <div className="mt-6 h-6 overflow-hidden rounded-md border-[3px] border-[#0A0A0A] bg-[#FFF5DC]">
          <div
            className="h-full border-r-[3px] border-[#0A0A0A] bg-[#B5F23D] transition-all duration-300"
            style={{ width: `${Math.max(12, progressPercent)}%` }}
          />
        </div>

        {/* Stages Checklist */}
        <ul className="mt-8 grid gap-3 text-sm font-bold sm:grid-cols-2">
          {stages.map((st) => {
            const isDone = st.state === 'done';
            const isActive = st.state === 'active';
            return (
              <li
                key={st.key}
                className={`flex items-center gap-2.5 transition-opacity ${
                  isDone || isActive ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <i
                  className="grid h-6 w-6 place-items-center rounded-md border-[3px] border-[#0A0A0A] text-xs font-bold not-italic"
                  style={{
                    backgroundColor: isDone ? '#12B76A' : isActive ? '#FFD60A' : '#FFFFFF',
                  }}
                >
                  {isDone ? '✓' : ''}
                </i>
                <span className="font-mono text-xs font-bold text-[#0A0A0A]">{st.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t-[3px] border-dashed border-[#0A0A0A] pt-5 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#5B5B52]">
            {activeStage?.label || 'Synthesizing knowledge...'}
          </p>
        </div>
      </div>
    </div>
  );
}
