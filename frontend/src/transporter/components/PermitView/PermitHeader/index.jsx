







export function PermitHeader({ permitNumber, route, material, status, stats }) {
  return (
    <div
      style={{
        background: 'var(--color-surface, #f7f3e8)',
        border: '2px solid var(--color-border, #2e9eeb33)',
        borderRadius: '2.2rem',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 8px 32px 0 #23283a22',
        position: 'relative',
        overflow: 'hidden'
      }}>
      
            <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--pattern-overlay, repeating-linear-gradient(135deg, #2e9eeb11 0 2px, transparent 2px 20px))',
        opacity: 0.18,
        pointerEvents: 'none',
        zIndex: 0
      }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display, Georgia)', fontWeight: 800, fontSize: '2.7rem', color: 'var(--color-bg, #181c24)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                        Permit {permitNumber}
                    </h1>
                    <p style={{ fontFamily: 'var(--font-ui, monospace)', fontSize: '1.1rem', color: 'var(--color-muted, #b0aeb8)', marginTop: '0.5rem' }}>
                        {route.from} → {route.to} · {material}
                    </p>
                </div>
                <span style={{
          fontFamily: 'var(--font-ui, monospace)',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: status === 'Active' ? '#22c55e' : '#f59e42',
          background: status === 'Active' ? '#dcfce7' : '#fef9c3',
          borderRadius: '0.7rem',
          padding: '0.5rem 1.2rem',
          marginLeft: '2rem'
        }}>
                    {status}
                </span>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', zIndex: 1, position: 'relative' }}>
                {stats.map((s) =>
        <div key={s.label} style={{ fontFamily: 'var(--font-ui, monospace)', fontWeight: 700, fontSize: '1.1rem', color: '#181c24', background: '#fff', borderRadius: '1.1rem', padding: '1.2rem 2.2rem', boxShadow: '0 2px 8px 0 #23283a11' }}>
                        <div style={{ fontSize: '0.9rem', color: '#b0aeb8', fontWeight: 400 }}>{s.label}</div>
                        {s.value}
                    </div>
        )}
            </div>
        </div>);

}