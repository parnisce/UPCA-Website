// Curved edge in the previous section's colour (via currentColor) that dips into the section below.
// Place as the first child of a `relative` section. `flip` mirrors the curve.
export default function SectionDivider({ className = 'text-white', flip = false, height = 'h-10 md:h-20' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 block w-full ${height} ${className}`}
      style={{ transform: `translateY(-1px)${flip ? ' scaleX(-1)' : ''}` }}
    >
      <path fill="currentColor" d="M0 0H1440V30C1180 105 880 120 640 84C400 48 190 36 0 78Z" />
    </svg>
  )
}
