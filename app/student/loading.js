export default function Loading() {
  const bar = (w) => (
    <div className="skeleton" style={{ height: 14, width: w, borderRadius: 6 }} />
  );
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
    </div>
  );
}
