export default function Loading() {
  return (
    <div className="page-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="page-loading-bar" aria-hidden />
    </div>
  );
}
