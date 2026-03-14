interface PermitHeaderProps {
  permitNumber: string;
  route: { from: string; to: string };
  material: string;
  status: string;
  stats: { label: string; value: string | number }[];
}
export function PermitHeader({ permitNumber, route, material, status, stats }: PermitHeaderProps) {
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
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--pattern-overlay, repeating-linear-gradient(135deg, #2e9eeb11 0 2px, transparent 2px 20px))',
        opacity: 0.18,
        pointerEvents: 'none',
        zIndex: 0,
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
          background: 'linear-gradient(90deg, var(--color-primary, #e4572e) 60%, var(--color-accent, #2e9eeb) 100%)',
          color: 'var(--color-text-invert, #f7f3e8)',
          fontFamily: 'var(--font-ui, monospace)',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '0.7em 1.5em',
          borderRadius: '2em',
          border: '2px solid var(--color-border, #2e9eeb33)',
          boxShadow: '0 2px 12px 0 #e4572e22',
          letterSpacing: '0.04em',
          display: 'inline-block',
        }}>{status}</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2.7rem',
        marginTop: '2.5rem',
        paddingTop: '2.5rem',
        borderTop: '1.5px solid var(--color-border, #2e9eeb33)',
        position: 'relative',
        zIndex: 1,
      }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{
              fontFamily: 'var(--font-ui, monospace)',
              fontSize: '0.92rem',
              color: 'var(--color-accent, #2e9eeb)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '0.3em',
              opacity: 0.85,
            }}>{label}</span>
            <span style={{
              fontFamily: 'var(--font-display, Georgia)',
              fontWeight: 800,
              fontSize: '2.1rem',
              color: 'var(--color-bg, #181c24)',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
