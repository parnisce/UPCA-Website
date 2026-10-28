// Lazy image with fixed aspect ratio (avoids layout shift) and optional parallax hook.
export default function Img({ src, alt, className = '', parallax = false, eager = false, ...rest }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      data-parallax={parallax ? '' : undefined}
      className={`h-full w-full object-cover ${parallax ? 'scale-[1.18]' : ''} ${className}`}
      {...rest}
    />
  )
}
