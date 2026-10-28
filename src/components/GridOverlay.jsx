// Faint blueprint grid with gold corner marks and small technical labels (Oryzo-style annotation layer).
export default function GridOverlay({ label = 'UPCA / MEDIA', coords = 'N 43.2557° W 79.8711°', className = '' }) {
  const mark = 'absolute size-3 border-gold/70'
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / .055) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / .055) 1px, transparent 1px)',
          backgroundSize: '8.3333% 100%, 100% 96px',
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 78%)',
        }}
      />
      <div className="absolute inset-x-5 inset-y-24 hidden md:block xl:inset-x-8">
        <span className={`${mark} left-0 top-0 border-l border-t`} />
        <span className={`${mark} right-0 top-0 border-r border-t`} />
        <span className={`${mark} bottom-0 left-0 border-b border-l`} />
        <span className={`${mark} bottom-0 right-0 border-b border-r`} />
        <span className="absolute left-5 top-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-gold/70">{label}</span>
        <span className="absolute right-5 bottom-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/40">{coords}</span>
      </div>
    </div>
  )
}
