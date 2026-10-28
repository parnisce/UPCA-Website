import { useState } from 'react'
import { LOGO_SRC } from '../data/siteContent'

// Uses the supplied brand logo file. Falls back to a plain wordmark only when the file is missing.
export default function Logo({ light = false, className = 'h-10' }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className={`display text-2xl font-black tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        UP<span className="text-gold">CA</span>
      </span>
    )
  }
  return <img src={LOGO_SRC} alt="UPCA Real Estate Marketing & Media" className={`w-auto ${className}`} onError={() => setFailed(true)} />
}
