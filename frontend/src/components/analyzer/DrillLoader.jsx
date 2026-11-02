import { useEffect, useState } from 'react';

export default function DrillLoader({ stages, repository, cached }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalStages = Math.max(1, stages.length);
  const doneCount = stages.filter((s) => s.state === 'done').length;
  const activeIdx = stages.findIndex((s) => s.state === 'active');
  const activeStage = stages[activeIdx] || stages[0];

  // Dynamic progress percentage
  let pct = (doneCount / totalStages) * 100;
  if (activeIdx >= 0) {
    pct = Math.min(94, (activeIdx / totalStages) * 100 + Math.min(18, elapsed * 3));
  }
  if (cached) pct = 100;
  const progressPercent = Math.max(12, Math.min(100, Math.round(pct)));

  return (
    <div className="gitvision-loader-root min-h-screen w-full px-5 py-12 md:py-20 flex flex-col items-center justify-center">
      <style>{`
        .gitvision-loader-root {
          background-color: #FFF5DC;
          background-image: radial-gradient(rgba(10,10,10,.16) 1.3px, transparent 1.3px);
          background-size: 22px 22px;
          color: #0A0A0A;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .nb {
          border: 3px solid #0A0A0A;
          border-radius: 12px;
          box-shadow: 6px 6px 0 #0A0A0A;
        }
        .lift {
          transition: transform .18s cubic-bezier(.3,1.6,.5,1), box-shadow .18s;
        }
        .lift:hover {
          transform: translate(-3px,-3px);
          box-shadow: 9px 9px 0 #0A0A0A;
        }
        .spin {
          animation: spin 12s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .gv-blink {
          animation: gv-blink 1.1s steps(2) infinite;
        }
        @keyframes gv-blink { 50% { opacity: .2; } }
      `}</style>

      {/* Main Loader Card */}
      <div
        className="nb relative w-full max-w-2xl bg-white p-7 sm:p-10 text-left"
        style={{ boxShadow: '10px 10px 0 #0A0A0A' }}
      >
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className="nb inline-flex items-center gap-2 bg-[#FFD60A] px-4 py-1.5 font-mono text-sm font-bold text-[#0A0A0A]"
            style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
          >
            <span className="spin inline-block">◆</span>
            {repository?.fullName || 'READING REPOSITORY'}
          </span>
          <span className="flex items-center gap-2 font-mono text-xs font-bold text-[#0A0A0A]">
            <span className="gv-blink h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-[#12B76A]" />
            {cached ? 'INSTANT CACHE HIT' : 'LIVE PIPELINE'}
          </span>
        </div>

        {/* Big Heading */}
        <h2 className="mt-6 font-['Archivo_Black'] text-3xl sm:text-4xl text-[#0A0A0A] leading-tight">
          {activeStage?.label || 'Processing repository data...'}
        </h2>
        <p className="mt-2 text-sm font-medium text-[#5B5B52]">
          Synthesizing commits, branches, architecture tree and documentation.
        </p>

        {/* Progress Bar Container */}
        <div className="mt-7">
          <div className="flex justify-between items-center mb-2 font-mono text-xs font-bold text-[#0A0A0A]">
            <span>PROGRESS</span>
            <span>{progressPercent}% • {elapsed}s ELAPSED</span>
          </div>
          <div className="h-7 w-full overflow-hidden rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFF5DC]">
            <div
              className="h-full border-r-[3px] border-[#0A0A0A] bg-[#B5F23D] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stages Checklist */}
        <ul className="mt-8 grid gap-3 text-sm font-bold sm:grid-cols-2">
          {stages.map((st) => {
            const isDone = st.state === 'done';
            const isActive = st.state === 'active';
            return (
              <li
                key={st.key}
                className={`nb flex items-center gap-3 p-3 transition-all ${
                  isActive
                    ? 'bg-[#FFD60A] text-[#0A0A0A]'
                    : isDone
                    ? 'bg-white text-[#0A0A0A]'
                    : 'bg-[#FFF5DC]/60 text-[#5B5B52] border-dashed'
                }`}
                style={{ boxShadow: isActive || isDone ? '3px 3px 0 #0A0A0A' : 'none' }}
              >
                <i
                  className="grid h-6 w-6 place-items-center rounded-md border-[2.5px] border-[#0A0A0A] text-xs font-bold not-italic"
                  style={{
                    backgroundColor: isDone ? '#12B76A' : isActive ? '#FF5C3A' : '#FFFFFF',
                    color: isDone ? '#FFFFFF' : isActive ? '#FFFFFF' : '#0A0A0A',
                  }}
                >
                  {isDone ? '✓' : isActive ? '▶' : '·'}
                </i>
                <span className="font-mono text-xs font-bold">{st.label}</span>
              </li>
            );
          })}
        </ul>

        {/* Bottom Banner */}
        <div className="mt-8 border-t-[3px] border-dashed border-[#0A0A0A] pt-5 flex items-center justify-between text-xs font-mono font-bold text-[#5B5B52]">
          <span>GITVISION AI ENGINE</span>
          <span className="bg-[#B5F23D] text-[#0A0A0A] px-2.5 py-1 border-2 border-[#0A0A0A] rounded-md">
            SPEED ACCELERATED
          </span>
        </div>
      </div>
    </div>
  );
}
