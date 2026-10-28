import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Subtle depth effect: the hero photo is mapped to a plane with a slow dolly and pointer-driven tilt.
// The plain <img> underneath is always visible, so this layer is purely progressive enhancement.
// Skipped on small screens, with reduced motion, or when WebGL is unavailable.
export default function HeroScene({ src }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', opacity: '0', transition: 'opacity 1.2s' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.z = 6

    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ transparent: true })
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    let texture
    let disposed = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      src,
      (t) => {
        if (disposed) return t.dispose()
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = renderer.capabilities.getMaxAnisotropy()
        texture = t
        material.map = t
        material.needsUpdate = true
        fit()
        renderer.domElement.style.opacity = '1'
      },
      undefined,
      () => {}, // on failure the <img> underneath remains
    )

    const size = { w: 1, h: 1 }
    function fit() {
      const { clientWidth: w, clientHeight: h } = mount
      if (!w || !h) return
      size.w = w
      size.h = h
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // cover-fit the plane to the viewport at z=0 (with a little overscan for the tilt)
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      const vw = vh * camera.aspect
      const imgAspect = texture ? texture.image.width / texture.image.height : 1.5
      const scale = 1.06
      let pw = vw * scale
      let ph = pw / imgAspect
      if (ph < vh * scale) {
        ph = vh * scale
        pw = ph * imgAspect
      }
      plane.scale.set(pw, ph, 1)
    }

    const target = { x: 0, y: 0 }
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const ro = new ResizeObserver(fit)
    ro.observe(mount)

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(mount)
    const clock = new THREE.Clock()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const t = clock.getElapsedTime()
      plane.rotation.y += (target.x * 0.035 - plane.rotation.y) * 0.05
      plane.rotation.x += (target.y * 0.025 - plane.rotation.x) * 0.05
      plane.position.x += (-target.x * 0.08 - plane.position.x) * 0.05
      plane.position.z = Math.sin(t * 0.25) * 0.12 // slow dolly
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      geometry.dispose()
      material.dispose()
      texture?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [src])

  return <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
}
