export default function RouteFallback() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-10" role="status" aria-label="Loading">
      <div className="skeleton h-12 w-2/3" />
      <div className="skeleton mt-6 h-5 w-1/2" />
      <div className="skeleton mt-3 h-5 w-2/5" />
    </div>
  );
}

