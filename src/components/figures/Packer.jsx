import { useEffect, useRef } from 'react'
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion'
import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { Dots, IsoFigure, Line, Solid } from '../anatomy/draw'
import { at, capsulePath, corners, elbowOf, fit, join, path3, worldToScreenOffset } from './iso'

export const WIDTH = 700
export const HEIGHT = 468

const FLOOR = { x: -168, y: -104, w: 384, d: 208, r: 26 }
const TABLE = { x: -54, y: -36, w: 132, d: 84, r: 8 }
const TABLE_TOP = 76
const BOX = { x: -20, y: -10, w: 56, d: 48, r: 2 }
const BOX_TOP = 114
const STACK = { x: 92, y: -54, w: 74, d: 66, r: 3 }
const CRATE = { x: 112, y: 24, w: 52, d: 44, r: 3 }
const BX = -104
const BY = 28
const LEAN = 4
const HIP = 84
const CYCLE = 11

const P = fit(
  [
    ...corners(FLOOR, 0, 0),
    ...corners(TABLE, 0, TABLE_TOP),
    ...corners(BOX, TABLE_TOP, 134),
    ...corners(STACK, 0, 66),
    ...corners(CRATE, 0, 48),
    [BX - 28, BY - 38, 0],
    [BX - 28, BY - 38, 190],
    [BX + 44, BY + 42, 0],
    [BX + 44, BY + 42, 190],
    [70, -70, 0],
    [70, -70, 152],
    [-40, 70, 0],
    [-40, 70, 152],
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, headroom: 4, azimuth: 38, elevation: 28 },
)

const point = at(P)
const solid = (plan, z, h, steps = 6, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel)
const cyl = (cx, cy, r, z, h, steps = 28) => k.cylinder(cx, cy, r, z, h, P, steps)
const panel = (points) => path3(P, points, true)
const line = (a, b) => k.segment(a, b, P)

const ANKLE_FAR = point([BX - 6, BY - 16, 8])
const ANKLE_NEAR = point([BX + 4, BY + 18, 8])
const TOE_FAR = [ANKLE_FAR[0] + 14, ANKLE_FAR[1] + 4]
const TOE_NEAR = [ANKLE_NEAR[0] + 14, ANKLE_NEAR[1] + 4]
const SHOE_FAR = capsulePath([ANKLE_FAR, TOE_FAR])
const SHOE_NEAR = capsulePath([ANKLE_NEAR, TOE_NEAR])
const SOLE_FAR = capsulePath([
  [ANKLE_FAR[0] - 2, ANKLE_FAR[1] + 5],
  [TOE_FAR[0], TOE_FAR[1] + 5],
])
const SOLE_NEAR = capsulePath([
  [ANKLE_NEAR[0] - 2, ANKLE_NEAR[1] + 5],
  [TOE_NEAR[0], TOE_NEAR[1] + 5],
])
const HIP_FAR = point([BX, BY - 15, HIP])
const HIP_NEAR = point([BX + 2, BY + 15, HIP])
const SHOULDER_FAR = point([BX + LEAN, BY - 22, 138])
const SHOULDER_NEAR = point([BX + LEAN, BY + 22, 136])

const ease = (value) => {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

function elbowFor(shoulder, hand) {
  const distance = Math.hypot(hand[0] - shoulder[0], hand[1] - shoulder[1])
  const length = Math.max(14, distance * 0.54)
  const one = elbowOf(shoulder, hand, length, length, 1)
  const two = elbowOf(shoulder, hand, length, length, -1)
  return one[1] > two[1] ? one : two
}

function kneeFor(hip, ankle) {
  const distance = Math.hypot(ankle[0] - hip[0], ankle[1] - hip[1])
  const length = Math.max(16, distance * 0.58)
  const one = elbowOf(hip, ankle, length, length, 1)
  const two = elbowOf(hip, ankle, length, length, -1)
  return one[0] > two[0] ? one : two
}

function flapPaths(closed) {
  const farEdgeY = lerp(-34, 14.5, closed)
  const farEdgeZ = lerp(134, BOX_TOP + 0.2, closed)
  const nearEdgeY = lerp(72, 14.5, closed)
  const nearEdgeZ = lerp(132, BOX_TOP + 0.2, closed)
  return {
    far: panel([
      [BOX.x + 2, BOX.y + 1, BOX_TOP + 0.2],
      [BOX.x + BOX.w - 2, BOX.y + 1, BOX_TOP + 0.2],
      [BOX.x + BOX.w - 2, farEdgeY, farEdgeZ],
      [BOX.x + 2, farEdgeY, farEdgeZ],
    ]),
    near: panel([
      [BOX.x + 2, BOX.y + BOX.d - 1, BOX_TOP + 0.2],
      [BOX.x + BOX.w - 2, BOX.y + BOX.d - 1, BOX_TOP + 0.2],
      [BOX.x + BOX.w - 2, nearEdgeY, nearEdgeZ],
      [BOX.x + 2, nearEdgeY, nearEdgeZ],
    ]),
  }
}

function poseAt(time) {
  const t = ((time % CYCLE) + CYCLE) % CYCLE
  const idleNear = [BX + 18, BY + 26, 98]
  const idleFar = [BX + 14, BY - 24, 98]
  let near = idleNear
  let far = idleFar
  let itemWorld = [-44, 34, 90]
  let itemOpacity = 1
  let itemHeld = false
  let flap = 0
  let tape = 0
  let gun = 0
  let label = 0

  if (t >= 0.8 && t < 1.6) {
    near = mix3(idleNear, [-44, 34, 92], ease((t - 0.8) / 0.8))
  } else if (t >= 1.6 && t < 2.1) {
    near = [-44, 34, 92]
    itemWorld = near
    itemHeld = true
  } else if (t >= 2.1 && t < 3.2) {
    const u = ease((t - 2.1) / 1.1)
    near = mix3([-44, 34, 92], [8, 20, 118], u)
    far = mix3(idleFar, [30, 43, 108], u)
    itemWorld = near
    itemHeld = true
    itemOpacity = 1 - ease(Math.max(0, (t - 2.85) / 0.35))
  } else if (t >= 3.2 && t < 4.1) {
    const u = ease((t - 3.2) / 0.9)
    near = mix3([8, 20, 118], [8, 26, 114], u)
    far = mix3([30, 43, 108], [8, 4, 114], u)
    itemOpacity = 0
  } else if (t >= 4.1 && t < 5.2) {
    const u = ease((t - 4.1) / 1.1)
    flap = u
    near = [8, 26, 114]
    far = [8, 4, 114]
    itemOpacity = 0
  } else if (t >= 5.2 && t < 7.1) {
    const u = ease((t - 5.2) / 1.6)
    near = mix3([-14, 15, 121], [42, 15, 121], u)
    far = [43, 26, 110]
    flap = 1
    tape = Math.min(1, (t - 5.2) / 1.7)
    gun = 1
    itemOpacity = 0
  } else if (t >= 7.1 && t < 8.2) {
    const u = ease((t - 7.1) / 1.1)
    near = mix3([42, 15, 121], [43, 12, 90], u)
    far = mix3([43, 26, 110], [10, 6, 117], u)
    flap = 1
    tape = 1
    label = Math.min(1, Math.max(0, (t - 7.55) / 0.35))
    itemOpacity = 0
  } else if (t >= 8.2 && t < 9.4) {
    const u = ease((t - 8.2) / 1.2)
    near = mix3([43, 12, 90], idleNear, u)
    far = mix3([10, 6, 117], idleFar, u)
    flap = 1
    tape = 1
    label = 1
    itemOpacity = 0
  } else if (t >= 9.4) {
    flap = 1
    tape = 1
    label = 1
    itemOpacity = 0
  }

  const nearHand = point(near)
  const farHand = point(far)
  const nearElbow = elbowFor(SHOULDER_NEAR, nearHand)
  const farElbow = elbowFor(SHOULDER_FAR, farHand)
  const flaps = flapPaths(flap)
  const kneeFar = kneeFor(HIP_FAR, ANKLE_FAR)
  const kneeNear = kneeFor(HIP_NEAR, ANKLE_NEAR)
  const itemAt = point(itemWorld)

  return {
    nearHand,
    farHand,
    nearElbow,
    farElbow,
    nearUpper: capsulePath([SHOULDER_NEAR, nearElbow]),
    nearLower: capsulePath([nearElbow, nearHand]),
    farUpper: capsulePath([SHOULDER_FAR, farElbow]),
    farLower: capsulePath([farElbow, farHand]),
    flapFar: flaps.far,
    flapNear: flaps.near,
    tape,
    gun,
    label,
    itemOpacity,
    itemHeld,
    itemAt,
    bodyShift: worldToScreenOffset(P, [BX + LEAN, BY, 0]),
    legFar: capsulePath([HIP_FAR, kneeFar]),
    legFarLower: capsulePath([kneeFar, ANKLE_FAR]),
    legNear: capsulePath([HIP_NEAR, kneeNear]),
    legNearLower: capsulePath([kneeNear, ANKLE_NEAR]),
  }
}

const INITIAL = poseAt(0)
const TAPE_START = point([BOX.x - 1, 14.5, BOX_TOP + 0.45])
const TAPE_END = point([BOX.x + BOX.w + 1, 14.5, BOX_TOP + 0.45])

function floorArt() {
  const lines = []
  for (let x = FLOOR.x; x <= FLOOR.x + FLOOR.w; x += 26) {
    lines.push(k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0.14, P))
  }
  for (let y = FLOOR.y; y <= FLOOR.y + FLOOR.d; y += 26) {
    lines.push(k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0.14, P))
  }
  return (
    <g key="floor">
      <ellipse className="fig-shadow" cx={point([-34, 18, 0])[0]} cy={point([-34, 18, 0])[1] + 10} rx="142" ry="28" opacity="0.48" />
      <ellipse className="fig-shadow" cx={point([132, 10, 0])[0]} cy={point([132, 10, 0])[1] + 8} rx="78" ry="18" opacity="0.36" />
      <Line d={join(lines)} tone="faint" />
      <Line d={k.planOutline(k.insetPlan(FLOOR, 6), 0.08, P, 10)} tone="faint" />
    </g>
  )
}

function tableArt() {
  const legs = [
    [TABLE.x + 5, TABLE.y + 5],
    [TABLE.x + TABLE.w - 13, TABLE.y + 5],
    [TABLE.x + 5, TABLE.y + TABLE.d - 13],
    [TABLE.x + TABLE.w - 13, TABLE.y + TABLE.d - 13],
  ]
  const bubble = G.solidOf(
    [
      [0, 7],
      [22, 7],
    ],
    G.frameAlong([-48, 12, 88], [0, 1, 0]),
    P,
    { steps: 32 },
  )
  const bubbleRings = join(
    [4, 11, 18].map((s) => k.sideRing([-48, 12 + s, 88], 7, [0, 1, 0], P, 24)),
  )
  return (
    <g key="table">
      {legs.map(([x, y], index) => (
        <Solid key={index} paths={solid({ x, y, w: 8, d: 8, r: 1.5 }, 0, 70, 3, 0.3)} tone="mid" crease="faint" className="part-metal" />
      ))}
      <Solid paths={solid({ x: TABLE.x + 4, y: TABLE.y + 12, w: TABLE.w - 8, d: TABLE.d - 24, r: 4 }, 18, 4, 4, 0.4)} tone="lo" crease="faint" className="part-card" />
      <Solid paths={solid(TABLE, 70, 6, 6, 1)} tone="mid" crease="lo" className="part-card" />
      <Line d={k.planOutline(k.insetPlan(TABLE, 4), 76, P, 6)} tone="faint" />
      <g className="part-tape">
        <Solid paths={cyl(-36, 18, 8, 76, 12, 28)} tone="mid" crease="faint" />
        <Line d={k.ring(-36, 18, 5.4, 88.2, P, 24)} tone="faint" />
        <Line d={k.ring(-36, 18, 2.2, 88.2, P, 16)} tone="faint" />
      </g>
      <Solid paths={bubble} tone="hi" crease="faint" className="part-glass" />
      <Line d={bubbleRings} tone="faint" />
      <g className="part-metal">
        <Line d={join([line([-18, 44, 77], [-2, 40, 77]), line([-6, 44, 77], [-18, 38, 77])])} tone="mid" free />
        <circle cx={point([-4, 41, 77])[0]} cy={point([-4, 41, 77])[1]} r="1.7" fill="var(--anatomy-lo)" />
        <circle cx={point([-18, 39, 77])[0]} cy={point([-18, 39, 77])[1]} r="1.7" fill="var(--anatomy-lo)" />
      </g>
    </g>
  )
}

function stackArt() {
  const a = { x: STACK.x + 4, y: STACK.y + 5, w: STACK.w - 8, d: STACK.d - 10, r: 2 }
  const b = { x: STACK.x + 10, y: STACK.y + 12, w: STACK.w - 20, d: STACK.d - 24, r: 2 }
  return (
    <g key="stack">
      <Solid paths={solid(a, 0, 32, 4, 0.8)} tone="hi" crease="lo" className="part-card" />
      <Line d={k.lineOnTop([a.x + 7, a.y + a.d / 2], [a.x + a.w - 7, a.y + a.d / 2], 32.2, P)} tone="faint" />
      <Solid paths={solid(b, 32, 28, 4, 0.8)} tone="hi" crease="lo" className="part-card" />
      <Line d={k.lineOnTop([b.x + 6, b.y + b.d / 2], [b.x + b.w - 6, b.y + b.d / 2], 60.2, P)} tone="faint" />
      <Solid paths={solid({ x: STACK.x + 18, y: STACK.y + 20, w: 16, d: 10, r: 2 }, 60, 10, 3, 0.4)} tone="hi" crease="lo" className="part-card" />
    </g>
  )
}

function crateArt() {
  const slats = [0, 1, 2].map((row) =>
    solid({ x: CRATE.x + 2, y: CRATE.y + 6 + row * 13, w: CRATE.w - 4, d: 7, r: 2 }, 0, 4, 3, 0.3),
  )
  return (
    <g key="crate">
      <Solid paths={solid(CRATE, 0, 44, 5, 0.8)} tone="mid" crease="lo" className="part-card" />
      {slats.map((paths, index) => (
        <Solid key={index} paths={paths} tone="lo" crease="faint" />
      ))}
      <Line
        d={join([
          line([CRATE.x + 4, CRATE.y + 1, 40], [CRATE.x + CRATE.w - 4, CRATE.y + 1, 40]),
          line([CRATE.x + 4, CRATE.y + 1, 6], [CRATE.x + CRATE.w - 4, CRATE.y + 1, 6]),
          line([CRATE.x + 8, CRATE.y + 1, 4], [CRATE.x + 8, CRATE.y + 1, 43]),
          line([CRATE.x + CRATE.w - 8, CRATE.y + 1, 4], [CRATE.x + CRATE.w - 8, CRATE.y + 1, 43]),
        ])}
        tone="faint"
      />
    </g>
  )
}

function boxArt(labelRef) {
  const label = panel([
    [BOX.x + BOX.w + 0.4, 4, 96],
    [BOX.x + BOX.w + 0.4, 22, 96],
    [BOX.x + BOX.w + 0.4, 22, 82],
    [BOX.x + BOX.w + 0.4, 4, 82],
  ])
  const labelLines = join([
    line([BOX.x + BOX.w + 0.5, 7, 92], [BOX.x + BOX.w + 0.5, 19, 92]),
    line([BOX.x + BOX.w + 0.5, 7, 89], [BOX.x + BOX.w + 0.5, 17, 89]),
    line([BOX.x + BOX.w + 0.5, 7, 86], [BOX.x + BOX.w + 0.5, 14, 86]),
  ])
  const sideSeam = join([
    line([BOX.x + 3, BOX.y + BOX.d + 0.35, 112], [BOX.x + 3, BOX.y + BOX.d + 0.35, 78]),
    line([BOX.x + BOX.w - 3, BOX.y + BOX.d + 0.35, 112], [BOX.x + BOX.w - 3, BOX.y + BOX.d + 0.35, 78]),
    line([BOX.x + 3, BOX.y - 0.35, 112], [BOX.x + 3, BOX.y - 0.35, 78]),
    line([BOX.x + BOX.w - 3, BOX.y - 0.35, 112], [BOX.x + BOX.w - 3, BOX.y - 0.35, 78]),
  ])
  return (
    <g key="box">
      <Solid paths={solid(BOX, TABLE_TOP, BOX_TOP - TABLE_TOP, 4, 0.8)} tone="hi" crease="lo" className="part-card" />
      <Line d={sideSeam} tone="faint" />
      <Line d={k.lineOnTop([BOX.x + 2, BOX.y + 4], [BOX.x + BOX.w - 2, BOX.y + 4], BOX_TOP + 0.15, P)} tone="faint" />
      <Line d={k.lineOnTop([BOX.x + 2, BOX.y + BOX.d - 4], [BOX.x + BOX.w - 2, BOX.y + BOX.d - 4], BOX_TOP + 0.15, P)} tone="faint" />
      <g ref={labelRef} className="box-label-group" opacity="0">
        <path className="box-label" d={label} />
        <Line d={labelLines} tone="mid" free />
      </g>
    </g>
  )
}

function torsoArt() {
  const reflective = panel([
    [15.45, -18, 122],
    [15.45, 18, 122],
    [15.45, 18, 117],
    [15.45, -18, 117],
  ])
  const pocket = panel([
    [15.5, 2, 108],
    [15.5, 15, 108],
    [15.5, 15, 96],
    [15.5, 2, 96],
  ])
  return (
    <g key="torso">
      <Solid paths={solid({ x: -15, y: -22, w: 30, d: 44, r: 9 }, 84, 8, 6, 0.5)} tone="mid" crease="faint" className="part-ink" />
      <Solid paths={solid({ x: -15, y: -22, w: 30, d: 44, r: 9 }, 92, 50, 6, 1.1)} tone="hi" crease="lo" className="part-brand" />
      <Line d={k.sideSeam({ x: -15, y: -22, w: 30, d: 44, r: 9 }, 142, P, 7)} tone="faint" />
      <g className="part-tape">
        <path className="iso-fill" d={reflective} />
        <path className="iso-line" data-tone="hi" d={reflective} />
      </g>
      <g className="part-ink">
        <path className="iso-fill" d={pocket} />
        <path className="iso-line" data-tone="lo" d={pocket} />
      </g>
      <Line d={line([15.55, 0, 94], [15.55, 0, 140])} tone="faint" free />
      <Line d={line([15.6, -16, 110], [15.6, 16, 110])} tone="faint" free />
      <Solid paths={solid({ x: -8, y: -14, w: 14, d: 28, r: 5 }, 142, 4, 4, 0.4)} tone="mid" crease="faint" className="part-ink" />

      <Solid paths={cyl(0, 0, 6, 144, 8, 20)} tone="mid" crease="none" className="part-skin" />
      <Solid paths={G.sphereOf([2, 0, 160], 13, P, { steps: 48 })} tone="hi" crease="none" className="part-skin" />
      <Solid paths={G.sphereOf([2, -13, 160], 3.2, P, { steps: 20 })} tone="mid" crease="none" className="part-skin" />
      <Solid paths={G.sphereOf([2, 13, 160], 3.2, P, { steps: 20 })} tone="mid" crease="none" className="part-skin" />
      <Dots points={[point([15.3, -4.2, 163]), point([15.3, 4.2, 163])]} size={0.6} tone="hi" />
      <Line d={join([line([13.5, -6, 166], [15, -2, 166]), line([13.5, 2, 166], [15, 6, 166])])} tone="mid" free />
      <Line d={line([16.4, 0, 159], [17.4, 0, 157])} tone="mid" free />
      <Line d={line([15.8, -4, 154], [15.8, 4, 154])} tone="mid" free />
      <Line d={line([15.6, 0, 153], [15.6, 0, 151])} tone="faint" free />

      <Solid paths={cyl(2, 0, 13.5, 168, 6, 40)} tone="mid" crease="faint" className="part-brand" />
      <Solid paths={solid({ x: 2, y: -13, w: 18, d: 26, r: 6 }, 166, 2.4, 4, 0.4)} tone="mid" crease="faint" className="part-brand" />
      <Solid paths={cyl(2, 0, 2.4, 174, 2, 16)} tone="mid" crease="none" className="part-metal" />
      <circle cx={point([14.8, 0, 171])[0]} cy={point([14.8, 0, 171])[1]} r="1.8" fill="#fff7ef" />
    </g>
  )
}

function shoeArt(shoe, sole, toe) {
  return (
    <g>
      <path className="safety-shoe" d={shoe} />
      <path className="safety-sole" d={sole} />
      <circle className="safety-toe" cx={toe[0]} cy={toe[1]} r="4.4" />
    </g>
  )
}

function setPath(node, d) {
  if (!node) return
  node.querySelectorAll('path').forEach((child) => child.setAttribute('d', d))
}

function setXY(node, x, y) {
  if (!node) return
  node.setAttribute('cx', x.toFixed(2))
  node.setAttribute('cy', y.toFixed(2))
}

export function PackerStage({ className = '' }) {
  const reduced = useReducedMotion()
  const stage = useRef(null)
  const bodyRef = useRef(null)
  const farUpper = useRef(null)
  const farLower = useRef(null)
  const farHand = useRef(null)
  const nearUpper = useRef(null)
  const nearLower = useRef(null)
  const nearHand = useRef(null)
  const legFar = useRef(null)
  const legFarLower = useRef(null)
  const legNear = useRef(null)
  const legNearLower = useRef(null)
  const flapFar = useRef(null)
  const flapNear = useRef(null)
  const itemRef = useRef(null)
  const gunRef = useRef(null)
  const labelRef = useRef(null)
  const tapeRef = useRef(null)
  const clock = useRef(0)
  const inView = useInView(stage, { margin: '160px 0px' })
  const ready = useRef(false)

  const apply = (state) => {
    if (bodyRef.current) {
      bodyRef.current.setAttribute('transform', `translate(${state.bodyShift[0].toFixed(2)} ${state.bodyShift[1].toFixed(2)})`)
    }
    setPath(farUpper.current, state.farUpper)
    setPath(farLower.current, state.farLower)
    setPath(nearUpper.current, state.nearUpper)
    setPath(nearLower.current, state.nearLower)
    setPath(legFar.current, state.legFar)
    setPath(legFarLower.current, state.legFarLower)
    setPath(legNear.current, state.legNear)
    setPath(legNearLower.current, state.legNearLower)
    setXY(farHand.current, state.farHand[0], state.farHand[1])
    setXY(nearHand.current, state.nearHand[0], state.nearHand[1])
    if (flapFar.current) flapFar.current.setAttribute('d', state.flapFar)
    if (flapNear.current) flapNear.current.setAttribute('d', state.flapNear)
    if (tapeRef.current) {
      tapeRef.current.setAttribute('strokeDashoffset', (1 - state.tape).toFixed(3))
      tapeRef.current.style.opacity = state.tape < 0.015 ? '0' : '1'
    }
    if (itemRef.current) {
      itemRef.current.setAttribute('transform', `translate(${state.itemAt[0].toFixed(2)} ${state.itemAt[1].toFixed(2)})`)
      itemRef.current.style.opacity = state.itemOpacity.toFixed(3)
    }
    if (gunRef.current) {
      gunRef.current.setAttribute('transform', `translate(${state.nearHand[0].toFixed(2)} ${state.nearHand[1].toFixed(2)})`)
      gunRef.current.style.opacity = state.gun.toFixed(3)
    }
    if (labelRef.current) labelRef.current.setAttribute('opacity', state.label.toFixed(3))
    ready.current = true
  }

  useAnimationFrame((time, delta) => {
    if (!inView || reduced) return
    clock.current += delta / 1000
    if (clock.current > CYCLE) clock.current -= CYCLE
    apply(poseAt(clock.current))
  })

  useEffect(() => {
    if (!ready.current) apply(reduced ? poseAt(6.3) : INITIAL)
  }, [reduced])

  const restart = () => {
    if (reduced) return
    clock.current = 0
    apply(poseAt(0))
  }

  return (
    <div
      ref={stage}
      className={`fig-iso packer-stage ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="Pekerja pria mengemas barang ke kardus, menutup flap, merekatkan lakban, dan menempel label. Tekan untuk mengulang gerakan."
      onClick={restart}
      onPointerEnter={restart}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          restart()
        }
      }}
    >
      <IsoFigure
        width={WIDTH}
        height={HEIGHT}
        label="Pekerja pria berseragam oranye mengemas barang di meja packing dengan lakban, bubble wrap, gunting, dan tumpukan kardus."
      >
        {floorArt()}
        {crateArt()}
        {stackArt()}
        {tableArt()}
        {boxArt(labelRef)}

        <g className="part-card">
          <path className="flap-fill" ref={flapFar} d={INITIAL.flapFar} />
          <path className="flap-fill" ref={flapNear} d={INITIAL.flapNear} />
        </g>

        <path
          className="tape-strip"
          d={`M${TAPE_START[0].toFixed(2)} ${TAPE_START[1].toFixed(2)}L${TAPE_END[0].toFixed(2)} ${TAPE_END[1].toFixed(2)}`}
          pathLength="1"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          style={{ opacity: 0 }}
          ref={tapeRef}
        />

        <g ref={legFar}>
          <path className="trouser-outline" d={INITIAL.legFar} />
          <path className="trouser-fill" d={INITIAL.legFar} />
        </g>
        <g ref={legFarLower}>
          <path className="trouser-outline" d={INITIAL.legFarLower} />
          <path className="trouser-fill" d={INITIAL.legFarLower} />
          <path className="trouser-stripe" d={INITIAL.legFarLower} />
        </g>
        {shoeArt(SHOE_FAR, SOLE_FAR, TOE_FAR)}

        <g ref={legNear}>
          <path className="trouser-outline" d={INITIAL.legNear} />
          <path className="trouser-fill" d={INITIAL.legNear} />
        </g>
        <g ref={legNearLower}>
          <path className="trouser-outline" d={INITIAL.legNearLower} />
          <path className="trouser-fill" d={INITIAL.legNearLower} />
          <path className="trouser-stripe" d={INITIAL.legNearLower} />
        </g>
        {shoeArt(SHOE_NEAR, SOLE_NEAR, TOE_NEAR)}

        <g ref={farUpper}>
          <path className="sleeve-outline" d={INITIAL.farUpper} />
          <path className="sleeve-fill" d={INITIAL.farUpper} />
        </g>
        <g ref={farLower}>
          <path className="skin-outline" d={INITIAL.farLower} />
          <path className="skin-fill" d={INITIAL.farLower} />
        </g>
        <circle ref={farHand} className="worker-hand" cx={INITIAL.farHand[0]} cy={INITIAL.farHand[1]} r="4.8" />

        <g ref={bodyRef} transform={`translate(${INITIAL.bodyShift[0].toFixed(2)} ${INITIAL.bodyShift[1].toFixed(2)})`}>
          {torsoArt()}
        </g>

        <g ref={nearUpper}>
          <path className="sleeve-outline" d={INITIAL.nearUpper} />
          <path className="sleeve-fill" d={INITIAL.nearUpper} />
        </g>
        <g ref={nearLower}>
          <path className="skin-outline" d={INITIAL.nearLower} />
          <path className="skin-fill" d={INITIAL.nearLower} />
        </g>

        <g
          ref={itemRef}
          transform={`translate(${INITIAL.itemAt[0].toFixed(2)} ${INITIAL.itemAt[1].toFixed(2)})`}
          style={{ opacity: INITIAL.itemOpacity }}
        >
          <rect className="packer-item" x="-7" y="-7" width="14" height="12" rx="2" />
          <path d="M-5 -2H5" stroke="#a17f52" strokeWidth="0.8" opacity="0.7" />
          <path d="M0 -6V5" stroke="#a17f52" strokeWidth="0.8" opacity="0.55" />
        </g>

        <circle ref={nearHand} className="worker-hand" cx={INITIAL.nearHand[0]} cy={INITIAL.nearHand[1]} r="4.8" />

        <g ref={gunRef} transform={`translate(${INITIAL.nearHand[0].toFixed(2)} ${INITIAL.nearHand[1].toFixed(2)})`} style={{ opacity: INITIAL.gun }}>
          <rect className="packer-gun-body" x="-5" y="-9" width="13" height="8" rx="2.5" />
          <rect className="packer-gun-body" x="-8" y="-4" width="7" height="10" rx="2" />
          <circle className="packer-gun-roll" cx="-2" cy="-5" r="3.6" />
          <path d="M-13 -1H-6" stroke="#a17f52" strokeWidth="0.8" opacity="0.8" />
        </g>
      </IsoFigure>
    </div>
  )
}

export default PackerStage
