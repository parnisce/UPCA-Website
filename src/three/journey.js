import * as THREE from 'three'
import { SCENES } from '../data/siteContent'

// ---------------------------------------------------------------------------------------------
// Cinematic property tour: one continuous WebGL environment, one camera travelling along a
// Catmull-Rom path. The six photos are *landmarks* (textured planes with depth layers) placed in
// that space; the camera approaches, dwells in front of each, then flies *through* it to the next.
// They are still images, so depth is faked with layering, fog, parallax and camera motion.
// ---------------------------------------------------------------------------------------------

const W = 11 // landmark width in world units
const ASPECT = 1672 / 941

// Landmark placement (centre, yaw, pitch). Tweak these to re-stage the tour.
const LANDMARKS = [
  { pos: [0, 0, 0], rotY: 0, rotX: 0 }, // 01 house
  { pos: [7, -0.5, -26], rotY: -0.22, rotX: 0 }, // 02 photographer
  { pos: [-3, 6, -52], rotY: 0.1, rotX: -0.35 }, // 03 drone / aerial (leans back so we can rise above it)
  { pos: [-10, 2, -82], rotY: 0.25, rotX: 0 }, // 04 matterport interior
  { pos: [6, 0, -112], rotY: -0.15, rotX: 0 }, // 05 website
  { pos: [0, 0, -142], rotY: 0, rotX: 0 }, // 06 social campaign
]

// Camera dwell pose per landmark, in each landmark's local space (plane faces +z).
// The look target is shifted left so the photo sits on the right and leaves room for the copy.
const DWELL = [
  { cam: [0, 0.4, 14], tgt: [-2.4, 0, 0] },
  { cam: [0, 0.3, 14], tgt: [-2.4, 0, 0] },
  { cam: [0, 6.8, 13], tgt: [-2.4, 0, 0] },
  { cam: [0, 0.3, 14], tgt: [-2.4, 0, 0] },
  { cam: [0, 0.2, 14], tgt: [-2.4, 0, 0] },
  { cam: [0, 0, 14.5], tgt: [-2.4, 0, 0] },
]
const PASS = [0, 0, -3] // local point just behind a plane: the camera flies through here

// Scroll progress at which each landmark is centred, and how long the camera rests there.
export const DWELL_P = [0.08, 0.25, 0.42, 0.59, 0.76, 0.94]
const HOLD = 0.035

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))
const easeOut = (t) => 1 - (1 - t) * (1 - t)

// Gold copy of a landmark frame, a few depth layers, and the photo itself
function buildLandmark(index, scene, loader, disposables) {
  const def = LANDMARKS[index]
  const sc = SCENES[index]
  const H = W / ASPECT
  const group = new THREE.Group()
  group.position.set(...def.pos)
  group.rotation.set(def.rotX, def.rotY, 0, 'YXZ')

  const quat = new THREE.Quaternion().setFromEuler(group.rotation)
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat)

  const geo = new THREE.PlaneGeometry(W, H)
  disposables.push(geo)

  const layers = [] // { mat, base }
  const addMat = (params, base) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, ...params })
    disposables.push(mat)
    layers.push({ mat, base })
    return mat
  }

  const tex = loader.load(sc.webp, () => {
    tex.needsUpdate = true
  })
  tex.colorSpace = THREE.SRGBColorSpace
  disposables.push(tex)

  // depth layer 1 (back): enlarged, darkened echo of the photo, reads as soft environment glow
  const back = new THREE.Mesh(geo, addMat({ map: tex, color: 0x32466e }, 0.55))
  back.position.z = -2.2
  back.scale.setScalar(1.45)
  back.renderOrder = (5 - index) * 10
  group.add(back)

  // depth layer 2 (main): the photo
  const main = new THREE.Mesh(geo, addMat({ map: tex }, 1))
  main.renderOrder = (5 - index) * 10 + 1
  group.add(main)

  // depth layer 3 (front): thin gold frames at two depths that slide against the photo as the camera moves
  const frameGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-W / 2, -H / 2, 0),
    new THREE.Vector3(W / 2, -H / 2, 0),
    new THREE.Vector3(W / 2, H / 2, 0),
    new THREE.Vector3(-W / 2, H / 2, 0),
  ])
  disposables.push(frameGeo)
  ;[
    { z: 0.6, s: 1.04, base: 0.5 },
    { z: 1.6, s: 1.1, base: 0.22 },
  ].forEach(({ z, s, base }, n) => {
    const mat = new THREE.LineBasicMaterial({ color: 0xfbb82a, transparent: true, opacity: 0, depthWrite: false })
    disposables.push(mat)
    layers.push({ mat, base })
    const frame = new THREE.LineLoop(frameGeo, mat)
    frame.position.z = z
    frame.scale.setScalar(s)
    frame.renderOrder = (5 - index) * 10 + 2 + n
    group.add(frame)
  })

  scene.add(group)
  return { group, normal, center: group.position.clone(), layers, quat }
}

// Listing-photo overlay for the website scene: the house photo "lands" in the laptop screen,
// as if the captured media becomes the digital listing.
function buildListingOverlay(landmark, loader, disposables) {
  const H = W / (1670 / 942)
  // screen photo area inside scene-05-website (fractions of the image, measured from the asset)
  const u0 = 0.196
  const u1 = 0.805
  const vTop = 0.188
  const vBot = 0.563
  const w = (u1 - u0) * W
  const h = (vBot - vTop) * H
  const tex = loader.load(SCENES[0].webp)
  tex.colorSpace = THREE.SRGBColorSpace
  // cover-crop the 16:9 house photo to the screen's wider aspect
  const regionAspect = w / h
  tex.repeat.set(1, ASPECT / regionAspect)
  tex.offset.set(0, (1 - tex.repeat.y) / 2)
  disposables.push(tex)
  const geo = new THREE.PlaneGeometry(w, h)
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })
  disposables.push(geo, mat)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = (5 - 4) * 10 + 5
  landmark.group.add(mesh)
  const rest = new THREE.Vector3(((u0 + u1) / 2 - 0.5) * W, (0.5 - (vTop + vBot) / 2) * H, 0.04)
  mesh.position.copy(rest)
  return { mesh, mat, rest }
}

export function createJourney(container, { onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const navy = new THREE.Color('#061330')
  renderer.setClearColor(navy)
  container.appendChild(renderer.domElement)
  Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

  const scene = new THREE.Scene()
  scene.background = navy
  scene.fog = new THREE.Fog(navy, 28, 120)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400)
  const disposables = []
  const loader = new THREE.TextureLoader()

  // --- landmarks ------------------------------------------------------------------------------
  const landmarks = LANDMARKS.map((_, i) => buildLandmark(i, scene, loader, disposables))
  const listing = buildListingOverlay(landmarks[4], loader, disposables)

  // --- environment: faint architectural grid + drifting gold dust for depth cues ---------------
  const grid = new THREE.GridHelper(400, 100, 0xfbb82a, 0x3b5a96)
  grid.position.set(0, -7, -70)
  grid.material.transparent = true
  grid.material.opacity = 0.16
  grid.material.depthWrite = false
  disposables.push(grid.geometry, grid.material)
  scene.add(grid)

  const N = 520
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70
    pos[i * 3 + 1] = (Math.random() - 0.5) * 34 + 3
    pos[i * 3 + 2] = 40 - Math.random() * 200
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const dustMat = new THREE.PointsMaterial({ color: 0xffd36b, size: 0.12, transparent: true, opacity: 0.55, depthWrite: false })
  const dust = new THREE.Points(dustGeo, dustMat)
  disposables.push(dustGeo, dustMat)
  scene.add(dust)

  // --- camera path (Catmull-Rom) --------------------------------------------------------------
  const w3 = (i, v) => new THREE.Vector3(...v).applyQuaternion(landmarks[i].quat).add(landmarks[i].center)
  const posPts = [new THREE.Vector3(0, 1.2, 36)]
  const tgtPts = [w3(0, [-2.2, 0, 0])]
  for (let i = 0; i < 6; i++) {
    posPts.push(w3(i, DWELL[i].cam)) // dwell in front of the landmark
    tgtPts.push(w3(i, DWELL[i].tgt))
    if (i < 5) {
      posPts.push(w3(i, PASS)) // fly through it...
      tgtPts.push(w3(i + 1, DWELL[i + 1].tgt)) // ...already turning toward the next one
    }
  }
  const posCurve = new THREE.CatmullRomCurve3(posPts, false, 'centripetal')
  const tgtCurve = new THREE.CatmullRomCurve3(tgtPts, false, 'centripetal')
  const lastIdx = posPts.length - 1 // 10 intervals

  // progress -> curve parameter, with a resting plateau at each landmark
  const segs = []
  let pp = 0
  let pu = 0
  DWELL_P.forEach((pd, k) => {
    const uD = 1 + 2 * k
    segs.push({ p0: pp, p1: pd - HOLD, u0: pu, u1: uD, ease: k === 0 ? easeOut : easeInOut })
    segs.push({ p0: pd - HOLD, p1: k === 5 ? 1 : pd + HOLD, u0: uD, u1: uD, ease: (t) => t })
    pp = pd + HOLD
    pu = uD
  })
  const curveU = (p) => {
    const s = segs.find((x) => p <= x.p1) || segs[segs.length - 1]
    const t = s.p1 === s.p0 ? 1 : Math.min(1, Math.max(0, (p - s.p0) / (s.p1 - s.p0)))
    return s.u0 + (s.u1 - s.u0) * s.ease(t)
  }

  // --- render loop ----------------------------------------------------------------------------
  const state = { target: 0, p: 0, mx: 0, my: 0, mxT: 0, myT: 0, visible: true }
  const tmpP = new THREE.Vector3()
  const tmpT = new THREE.Vector3()
  const clock = new THREE.Clock()

  const onMove = (e) => {
    state.mxT = (e.clientX / window.innerWidth - 0.5) * 2
    state.myT = (e.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // keep the photo comfortably framed on narrower windows
    camera.fov = camera.aspect < 1.5 ? 40 + (1.5 - camera.aspect) * 22 : 40
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  const io = new IntersectionObserver(([e]) => (state.visible = e.isIntersecting))
  io.observe(container)

  const dist = new THREE.Vector3()
  function render() {
    const t = clock.getElapsedTime()
    state.p += (state.target - state.p) * 0.085 // extra smoothing on top of the scroll
    state.mx += (state.mxT - state.mx) * 0.04
    state.my += (state.myT - state.my) * 0.04
    const p = state.p
    const u = curveU(p) / lastIdx

    posCurve.getPoint(u, tmpP)
    tgtCurve.getPoint(u, tmpT)
    // gentle handheld sway + pointer parallax
    tmpP.x += Math.sin(t * 0.45) * 0.09 + state.mx * 0.35
    tmpP.y += Math.cos(t * 0.37) * 0.06 - state.my * 0.2
    camera.position.copy(tmpP)
    camera.lookAt(tmpT)

    // landmarks fade as the camera flies through them (and are hidden once passed)
    landmarks.forEach((lm) => {
      dist.copy(camera.position).sub(lm.center)
      const d = dist.dot(lm.normal)
      const a = d <= 0.6 ? 0 : smooth(2.2, 9.5, d)
      lm.layers.forEach(({ mat, base }) => {
        const o = a * base
        mat.opacity = o
        mat.transparent = o < 0.999 || mat.type === 'LineBasicMaterial' || base < 1
        mat.depthWrite = !mat.transparent
        mat.visible = o > 0.003
      })
      lm.group.visible = a > 0.003
    })

    // listing overlay: the photo flies from beside the camera onto the laptop screen, then dissolves into the real one
    const a = smooth(0.62, 0.76, p)
    const lm5 = landmarks[4]
    const ov = listing.mesh
    ov.position.set(listing.rest.x - (1 - a) * 5.5, listing.rest.y + (1 - a) * 1.4, listing.rest.z + (1 - a) * 8)
    ov.scale.setScalar(1 + (1 - a) * 0.8)
    ov.rotation.y = (1 - a) * 0.5
    listing.mat.opacity = smooth(0.62, 0.68, p) * (1 - smooth(0.8, 0.88, p)) * Math.min(1, lm5.layers[1].mat.opacity * 2)
    ov.visible = listing.mat.opacity > 0.003

    dust.rotation.y = Math.sin(t * 0.05) * 0.05
    dust.position.z = Math.sin(t * 0.1) * 1.2
    renderer.render(scene, camera)
    onFrame?.(p)
  }

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (state.visible) render()
  }
  loop()

  return {
    setProgress(p) {
      state.target = Math.min(1, Math.max(0, p))
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      disposables.forEach((d) => d.dispose?.())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
