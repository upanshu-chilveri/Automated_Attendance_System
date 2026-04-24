export default function Loading() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
      </div>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12, marginBottom: '0.75rem' }} />)}
    </div>
  );
}
