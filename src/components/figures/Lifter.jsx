import { useEffect, useRef } from 'react'
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion'
import * as k from '../anatomy/iso-kit.mjs'
import * as G from '../anatomy/lathe.mjs'
import { Dots, FaceText, IsoFigure, Line, Solid } from '../anatomy/draw'
import { at, capsulePath, corners, elbowOf, fit, join, path3, worldToScreenOffset } from './iso'

export const WIDTH = 760
export const HEIGHT = 480

const AZ = 38
const EL = 27
const WORKER_Y = 64
const WORKER_START = -172
const STACK = { x: -228, y: WORKER_Y - 17, w: 36, d: 34, r: 3 }
const SOURCE_X = -210
const SOURCE_Z = 34
const BOX_W = 36
const BOX_D = 34
const BOX_H = 34
const BOX_CENTER_Z = SOURCE_Z + BOX_H / 2
const CHEST_Z = 108
const HIP_REST = 84
const HIP_CROUCH = 58
const TRIP = 10
const MASTER = 32
const RESET_START = 30
const RESET_END = 31.8

const BED = { x: -110, y: -68, w: 140, d: 96, r: 3 }
const BED_FLOOR = 52
const BED_WALL = 26
const BED_TOP = BED_FLOOR + 6 + BED_WALL
const BED_BOX_BOTTOM = BED_FLOOR + 6
const BED_BOX_CENTER = BED_BOX_BOTTOM + BOX_H / 2
const BED_SLOTS = [-92, -49, -6]
const BED_BOX_Y = 0
const TRUCK_Y = -20
const CHASSIS = { x: -105, y: -54, w: 295, d: 68, r: 4 }
const CAB_LOW = { x: 30, y: -68, w: 160, d: 96, r: 6 }
const CAB_HIGH = { x: 36, y: -64, w: 148, d: 88, r: 7 }
const NOSE = { x: 184, y: -60, w: 18, d: 80, r: 3 }
const HOOD = { x: 186, y: -56, w: 16, d: 72, r: 3 }
const TYRE_R = 24
const REAR_X = -55
const FRONT_X = 122

const P = fit(
  [
    ...corners(BED, 0, BED_TOP),
    ...corners(CAB_LOW, 0, 132),
    ...corners(NOSE, 0, 90),
    ...corners(STACK, 0, 68),
    ...corners({ x: -184, y: -66, w: 412, d: 132, r: 0 }, 0, 4),
    [REAR_X, -44, 0],
    [REAR_X, 44, 48],
    [FRONT_X, -44, 0],
    [FRONT_X, 44, 48],
    [-232, WORKER_Y - 26, 0],
    [-232, WORKER_Y + 26, 0],
    [-232, WORKER_Y - 26, 190],
    [18, WORKER_Y + 26, 190],
    [-60, WORKER_Y - 26, 0],
    [26, WORKER_Y + 26, 96],
  ],
  WIDTH,
  HEIGHT,
  { pad: 24, headroom: 2, azimuth: AZ, elevation: EL },
)

const point = at(P)
const solid = (plan, z, h, steps = 6, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel)
const cyl = (cx, cy, r, z, h, steps = 28) => k.cylinder(cx, cy, r, z, h, P, steps)
const panel = (points) => path3(P, points, true)
const line = (a, b) => k.segment(a, b, P)

const BASE_ANKLE_FAR = point([0, WORKER_Y - 14, 8])
const BASE_ANKLE_NEAR = point([0, WORKER_Y + 14, 8])
const SHOE_TOE_FAR = [BASE_ANKLE_FAR[0] + 13, BASE_ANKLE_FAR[1] + 4]
const SHOE_TOE_NEAR = [BASE_ANKLE_NEAR[0] + 13, BASE_ANKLE_NEAR[1] + 4]
const SHOE_FAR = capsulePath([BASE_ANKLE_FAR, SHOE_TOE_FAR])
const SHOE_NEAR = capsulePath([BASE_ANKLE_NEAR, SHOE_TOE_NEAR])
const SOLE_FAR = capsulePath([
  [BASE_ANKLE_FAR[0] - 2, BASE_ANKLE_FAR[1] + 5],
  [SHOE_TOE_FAR[0], SHOE_TOE_FAR[1] + 5],
])
const SOLE_NEAR = capsulePath([
  [BASE_ANKLE_NEAR[0] - 2, BASE_ANKLE_NEAR[1] + 5],
  [SHOE_TOE_NEAR[0], SHOE_TOE_NEAR[1] + 5],
])

const ease = (value) => {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
const clamp = (value) => Math.min(1, Math.max(0, value))

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

function bedOpacities(time) {
  return BED_SLOTS.map((_, index) => {
    const placedAt = index * TRIP + 7.4
    let value = clamp((time - placedAt) / 0.24)
    if (time >= RESET_START) value *= 1 - ease((time - RESET_START) / (RESET_END - RESET_START))
    return clamp(value)
  })
}

function poseAt(time) {
  const cycle = ((time % MASTER) + MASTER) % MASTER
  const active = Math.min(cycle, TRIP * 3 - 0.001)
  const trip = Math.floor(active / TRIP)
  const local = active - trip * TRIP
  const placeX = BED_SLOTS[trip] - 22

  let baseX = WORKER_START
  let hipZ = HIP_REST
  let grip = 0
  let walk = 0
  let phase = 0
  let boxX = SOURCE_X
  let boxY = WORKER_Y
  let boxZ = BOX_CENTER_Z
  let carried = 0
  let source = 1

  if (local < 1.1) {
    baseX = WORKER_START
  } else if (local < 2.2) {
    const u = ease((local - 1.1) / 1.1)
    baseX = lerp(WORKER_START, WORKER_START + 4, u)
    hipZ = lerp(HIP_REST, HIP_CROUCH, u)
    grip = u
    source = 1 - ease((local - 1.9) / 0.25)
    carried = ease((local - 1.9) / 0.25)
  } else if (local < 2.7) {
    baseX = WORKER_START + 4
    hipZ = HIP_CROUCH
    grip = 1
    source = 0
    carried = 1
  } else if (local < 3.8) {
    const u = ease((local - 2.7) / 1.1)
    baseX = WORKER_START + 4
    hipZ = lerp(HIP_CROUCH, HIP_REST, u)
    grip = 1
    source = 0
    carried = ease((local - 2.55) / 0.25)
    boxX = lerp(SOURCE_X, baseX + 36, u)
    boxZ = lerp(BOX_CENTER_Z, CHEST_Z, u)
  } else if (local < 6.1) {
    const u = ease((local - 3.8) / 2.3)
    baseX = lerp(WORKER_START + 4, placeX, u)
    walk = Math.min(1, (local - 3.8) / 0.25, (6.1 - local) / 0.25)
    phase = (local - 3.8) * 6.4
    grip = 1
    source = 0
    carried = 1
    boxX = baseX + 36
    boxZ = CHEST_Z
  } else if (local < 7.5) {
    baseX = placeX
    grip = 1
    source = 0
    if (local < 6.65) {
      const u = ease((local - 6.1) / 0.55)
      boxX = lerp(placeX + 36, BED_SLOTS[trip], u)
      boxY = lerp(WORKER_Y, BED_BOX_Y, u)
      boxZ = lerp(CHEST_Z, BED_BOX_CENTER + 30, u)
    } else {
      const u = ease((local - 6.65) / 0.85)
      boxX = BED_SLOTS[trip]
      boxY = BED_BOX_Y
      boxZ = lerp(BED_BOX_CENTER + 30, BED_BOX_CENTER, u)
    }
    carried = local < 7.25 ? 1 : 1 - ease((local - 7.25) / 0.25)
  } else if (local < 10) {
    const u = ease((local - 7.8) / 2.2)
    baseX = local < 7.8 ? placeX : lerp(placeX, WORKER_START, u)
    walk = local < 7.8 ? 0 : Math.min(1, (local - 7.8) / 0.25, (10 - local) / 0.3)
    phase = Math.max(0, local - 7.8) * 6.4
    grip = 1 - ease((local - 7.8) / 1.1)
    source = clamp((local - 9.55) / 0.4)
    carried = local < 7.25 ? 1 : 1 - ease((local - 7.25) / 0.25)
    boxX = BED_SLOTS[trip]
    boxY = BED_BOX_Y
    boxZ = BED_BOX_CENTER
  }

  if (cycle >= TRIP * 3) {
    baseX = WORKER_START
    hipZ = HIP_REST
    grip = 0
    walk = 0
    source = 1
    carried = 0
  }

  const bob = Math.sin(phase * 2) * 1.4 * walk
  const hipFar = point([baseX, WORKER_Y - 14, hipZ + bob])
  const hipNear = point([baseX, WORKER_Y + 14, hipZ + bob])
  const strideFar = Math.sin(phase) * 14 * walk
  const strideNear = Math.sin(phase + Math.PI) * 14 * walk
  const liftFar = Math.max(0, Math.sin(phase)) * 6 * walk
  const liftNear = Math.max(0, Math.sin(phase + Math.PI)) * 6 * walk
  const ankleFar = point([baseX + strideFar, WORKER_Y - 14, 8 + liftFar])
  const ankleNear = point([baseX + strideNear, WORKER_Y + 14, 8 + liftNear])
  const kneeFar = kneeFor(hipFar, ankleFar)
  const kneeNear = kneeFor(hipNear, ankleNear)

  const shoulderFar = point([baseX, WORKER_Y - 22, hipZ + 58 + bob])
  const shoulderNear = point([baseX, WORKER_Y + 22, hipZ + 58 + bob])
  const idleFar = point([baseX + 4 + Math.sin(phase) * 8 * walk, WORKER_Y - 22, hipZ + 18 + bob])
  const idleNear = point([baseX + 4 - Math.sin(phase) * 8 * walk, WORKER_Y + 22, hipZ + 18 + bob])
  const gripFar = point([boxX, boxY - (BOX_D / 2 + 6), boxZ])
  const gripNear = point([boxX, boxY + BOX_D / 2 + 6, boxZ])
  const handFar = mix(idleFar, gripFar, grip)
  const handNear = mix(idleNear, gripNear, grip)
  const elbowFar = elbowFor(shoulderFar, handFar)
  const elbowNear = elbowFor(shoulderNear, handNear)

  return {
    baseX,
    hipZ,
    bob,
    grip,
    walk,
    boxX,
    boxY,
    boxZ,
    carried,
    source,
    bed: bedOpacities(cycle),
    hipFar,
    hipNear,
    kneeFar,
    kneeNear,
    ankleFar,
    ankleNear,
    shoulderFar,
    shoulderNear,
    elbowFar,
    elbowNear,
    handFar,
    handNear,
    farThigh: capsulePath([hipFar, kneeFar]),
    farShin: capsulePath([kneeFar, ankleFar]),
    nearThigh: capsulePath([hipNear, kneeNear]),
    nearShin: capsulePath([kneeNear, ankleNear]),
    farUpper: capsulePath([shoulderFar, elbowFar]),
    farLower: capsulePath([elbowFar, handFar]),
    nearUpper: capsulePath([shoulderNear, elbowNear]),
    nearLower: capsulePath([elbowNear, handNear]),
    shoeFar: [ankleFar[0] - BASE_ANKLE_FAR[0], ankleFar[1] - BASE_ANKLE_FAR[1]],
    shoeNear: [ankleNear[0] - BASE_ANKLE_NEAR[0], ankleNear[1] - BASE_ANKLE_NEAR[1]],
    bodyShift: worldToScreenOffset(P, [baseX, WORKER_Y, hipZ - HIP_REST + bob]),
    shadowShift: worldToScreenOffset(P, [baseX, WORKER_Y, 0]),
    boxShift: worldToScreenOffset(P, [boxX - SOURCE_X, boxY - WORKER_Y, boxZ - BOX_CENTER_Z]),
  }
}

const INITIAL = poseAt(0)

function contactShadow(cx, cy, rx, ry, opacity = 0.44) {
  const center = point([cx, cy, 0])
  return <ellipse className="fig-shadow" cx={center[0]} cy={center[1] + 7} rx={rx} ry={ry} opacity={opacity} />
}

function Wheel({ x, near }) {
  const inner = near ? 20 : -53
  const outer = near ? 38 : -71
  const tyre = G.solidOf(
    [
      [0, TYRE_R],
      [18, TYRE_R],
    ],
    G.frameAlong([x, inner, TYRE_R], [0, 1, 0]),
    P,
    { steps: 44 },
  )
  const sidewall = k.sideRing([x, outer, TYRE_R], TYRE_R - 7, [0, 1, 0], P, 36)
  const rim = G.solidOf(
    [
      [0, 13.5],
      [1.6, 13.5],
    ],
    G.frameAlong([x, near ? 37.4 : -70.4, TYRE_R], [0, 1, 0]),
    P,
    { steps: 36 },
  )
  const hub = G.solidOf(
    [
      [0, 4.8],
      [1.8, 4.8],
    ],
    G.frameAlong([x, near ? 39.2 : -72.2, TYRE_R], [0, 1, 0]),
    P,
    { steps: 22 },
  )
  const center = point([x, outer, TYRE_R])
  return (
    <g>
      <Solid paths={tyre} tone="lo" crease="faint" className="part-tyre" />
      <Line d={sidewall} tone="faint" />
      <Solid paths={rim} tone="mid" crease="faint" className="part-rim" />
      <Solid paths={hub} tone="hi" crease="none" className="part-rim" />
      <circle cx={center[0]} cy={center[1]} r="2" fill="var(--fig-ink)" opacity={near ? 0.85 : 0.4} />
    </g>
  )
}

function boxSolid(plan, z, h, key, className = 'part-card') {
  return (
    <g key={key}>
      <Solid paths={solid(plan, z, h, 4, 0.8)} tone="hi" crease="lo" className={className} />
      <Line
        d={k.lineOnTop([plan.x + 5, plan.y + plan.d / 2], [plan.x + plan.w - 5, plan.y + plan.d / 2], z + h + 0.2, P)}
        tone="faint"
      />
      <Line
        d={join([
          line([plan.x + 4, plan.y + plan.d + 0.3, z + h - 5], [plan.x + 4, plan.y + plan.d + 0.3, z + 5]),
          line([plan.x + plan.w - 4, plan.y + plan.d + 0.3, z + h - 5], [plan.x + plan.w - 4, plan.y + plan.d + 0.3, z + 5]),
        ])}
        tone="faint"
      />
    </g>
  )
}

function pickupArt(bedRefs) {
  const stripe = panel([
    [BED.x + 5, BED.y + BED.d + 0.4, 78],
    [BED.x + BED.w - 5, BED.y + BED.d + 0.4, 78],
    [BED.x + BED.w - 5, BED.y + BED.d + 0.4, 68],
    [BED.x + 5, BED.y + BED.d + 0.4, 68],
  ])
  const sideWindow = panel([
    [62, 24.45, 124],
    [150, 24.45, 124],
    [150, 24.45, 96],
    [62, 24.45, 96],
  ])
  const windshield = panel([
    [184.45, -42, 124],
    [184.45, 42, 124],
    [184.45, 42, 94],
    [184.45, -42, 94],
  ])
  const grille = panel([
    [202.4, -25, 74],
    [202.4, 25, 74],
    [202.4, 25, 54],
    [202.4, -25, 54],
  ])
  const grilleLines = join([58, 63, 68, 72].map((z) => line([202.5, -23, z], [202.5, 23, z])))
  const logoY = BED.y + BED.d + 0.45
  return (
    <g key="pickup">
      <Wheel x={REAR_X} near={false} />
      <Wheel x={FRONT_X} near={false} />

      <Solid paths={solid(CHASSIS, 18, 8, 5, 0.6)} tone="mid" crease="faint" className="part-ink" />
      <Solid paths={solid({ x: -96, y: -54, w: 14, d: 68, r: 2 }, 23, 7, 3, 0.3)} tone="lo" crease="faint" />
      <Solid paths={solid({ x: 102, y: -54, w: 14, d: 68, r: 2 }, 23, 7, 3, 0.3)} tone="lo" crease="faint" />

      <Solid paths={solid(BED, BED_FLOOR, 6, 5, 0.6)} tone="mid" crease="faint" className="part-cargo" />
      <Solid
        paths={solid({ x: BED.x, y: BED.y, w: BED.w, d: 6, r: 2 }, BED_FLOOR + 6, BED_WALL, 4, 0.5)}
        tone="mid"
        crease="faint"
        className="part-cargo"
      />
      <Solid
        paths={solid({ x: BED.x - 6, y: BED.y + 5, w: 6, d: BED.d - 10, r: 2 }, 56, BED_TOP - 56, 4, 0.5)}
        tone="lo"
        crease="faint"
        className="part-cargo"
      />
      <Solid
        paths={solid({ x: 24, y: BED.y + 5, w: 6, d: BED.d - 10, r: 2 }, 58, BED_WALL, 4, 0.5)}
        tone="mid"
        crease="faint"
        className="part-cargo"
      />

      {BED_SLOTS.map((x, index) => (
        <g
          key={index}
          ref={(node) => {
            bedRefs.current[index] = node
          }}
          opacity="0"
        >
          {boxSolid(
            { x: x - BOX_W / 2, y: BED_BOX_Y - BOX_D / 2, w: BOX_W, d: BOX_D, r: 2 },
            BED_BOX_BOTTOM,
            BOX_H,
            `bed-${index}`,
          )}
        </g>
      ))}

      <Solid
        paths={solid({ x: BED.x, y: BED.y + BED.d - 6, w: BED.w, d: 6, r: 2 }, BED_FLOOR + 6, BED_WALL, 4, 0.5)}
        tone="hi"
        crease="faint"
        className="part-cargo"
      />
      <g className="part-brand">
        <path className="iso-fill" d={stripe} />
        <path className="iso-line" data-tone="hi" d={stripe} />
      </g>
      <Solid
        paths={solid({ x: BED.x - 6, y: BED.y + 6, w: 6, d: BED.d - 12, r: 2 }, 56, BED_TOP - 56, 4, 0.5)}
        tone="mid"
        crease="faint"
        className="part-cargo"
      />
      <Line
        d={join([
          line([BED.x - 6.4, -28, BED_TOP - 3], [BED.x - 6.4, 18, BED_TOP - 3]),
          line([BED.x - 6.4, -28, 62], [BED.x - 6.4, 18, 62]),
          line([BED.x - 6.4, -5, BED_TOP - 3], [BED.x - 6.4, -5, 62]),
        ])}
        tone="faint"
      />

      <Solid paths={solid(CAB_LOW, 30, 58, 6, 1)} tone="hi" crease="lo" className="part-brand" />
      <Solid paths={solid(CAB_HIGH, 88, 40, 6, 0.9)} tone="hi" crease="lo" className="part-brand" />
      <Solid paths={solid(NOSE, 42, 42, 4, 0.7)} tone="hi" crease="faint" className="part-brand" />
      <Solid paths={solid(HOOD, 84, 6, 4, 0.5)} tone="hi" crease="faint" className="part-brand" />
      <Solid paths={solid({ x: 38, y: -62, w: 146, d: 84, r: 8 }, 128, 3.4, 5, 0.5)} tone="mid" crease="faint" className="part-cargo" />
      <g className="part-glass">
        <path className="iso-fill" d={sideWindow} />
        <path className="iso-line" data-tone="lo" d={sideWindow} />
        <path className="iso-fill" d={windshield} />
        <path className="iso-line" data-tone="lo" d={windshield} />
      </g>
      <Line d={join([line([104, 24.55, 96], [104, 24.55, 124]), line([184.55, -26, 98], [184.55, -4, 106])])} tone="faint" free />
      <Line
        d={join([
          line([52, 28.45, 86], [52, 28.45, 34]),
          line([52, 28.45, 84], [142, 28.45, 84]),
          line([142, 28.45, 84], [142, 28.45, 34]),
        ])}
        tone="faint"
      />
      <FaceText transform={k.sideMatrix([54, 28.6], 74, P, 'left')} size={16} tone="hi" className="brand-text">
        LH
      </FaceText>
      <FaceText transform={k.sideMatrix([54, 28.6], 64, P, 'left')} size={5.8} tone="hi" className="brand-text brand-sub">
        SUZUKI CARRY TAYO
      </FaceText>
      <Solid paths={solid({ x: 130, y: 28.45, w: 12, d: 2, r: 1 }, 74, 2.6, 3, 0.3)} tone="mid" crease="faint" />
      <Solid paths={solid({ x: 158, y: 24, w: 5, d: 14, r: 1.2 }, 112, 2.4, 3, 0.3)} tone="mid" crease="faint" />
      <Solid paths={solid({ x: 156, y: 36, w: 11, d: 5, r: 2 }, 104, 12, 4, 0.4)} tone="ink" crease="faint" />

      <g className="part-ink">
        <path className="iso-fill" d={grille} />
        <path className="iso-line" data-tone="hi" d={grille} />
        <Line d={grilleLines} tone="mid" />
      </g>
      <g className="part-metal">
        <Solid paths={solid({ x: 198, y: -62, w: 14, d: 84, r: 4 }, 30, 12, 4, 0.4)} tone="mid" crease="faint" />
        <Solid paths={solid({ x: -122, y: -56, w: 11, d: 72, r: 4 }, 30, 10, 4, 0.4)} tone="mid" crease="faint" />
      </g>
      <Solid paths={solid({ x: 202.4, y: -50, w: 2.2, d: 12, r: 2 }, 58, 10, 4, 0.3)} tone="hi" crease="faint" className="part-paper" />
      <Solid paths={solid({ x: 202.4, y: 8, w: 2.2, d: 12, r: 2 }, 58, 10, 4, 0.3)} tone="hi" crease="faint" className="part-paper" />

      <path className="iso-fill arch-dark" d={arch(REAR_X, TYRE_R, 30, BED.y + BED.d + 0.45)} />
      <path className="iso-fill arch-dark" d={arch(FRONT_X, TYRE_R, 31, 28.45)} />
      <Wheel x={REAR_X} near />
      <Wheel x={FRONT_X} near />

      <Line d={line([BED.x + 10, logoY, 62], [BED.x + BED.w - 10, logoY, 62])} tone="faint" />
      <Dots points={[point([BED.x + 8, logoY, 81]), point([BED.x + BED.w - 8, logoY, 81])]} size={0.45} tone="mid" />
    </g>
  )
}

function arch(cx, z, radius, y) {
  const points = []
  for (let step = 0; step <= 28; step += 1) {
    const angle = (step / 28) * Math.PI
    points.push([cx + Math.cos(angle) * radius, y, z + Math.sin(angle) * radius])
  }
  return path3(P, points, true)
}

function torsoArt() {
  const reflective = panel([
    [15.45, -18, 122],
    [15.45, 18, 122],
    [15.45, 18, 117],
    [15.45, -18, 117],
  ])
  const logo = panel([
    [15.5, -12, 135],
    [15.5, -2, 135],
    [15.5, -2, 126],
    [15.5, -12, 126],
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
      <g className="part-paper">
        <path className="iso-fill" d={logo} />
        <path className="iso-line" data-tone="lo" d={logo} />
        <Line d={join([line([15.6, -10, 132], [15.6, -4, 132]), line([15.6, -10, 129], [15.6, -6, 129])])} tone="mid" free />
      </g>
      <Line d={line([15.55, 0, 94], [15.55, 0, 140])} tone="faint" free />
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

function carriedBoxArt() {
  const plan = { x: SOURCE_X - BOX_W / 2, y: WORKER_Y - BOX_D / 2, w: BOX_W, d: BOX_D, r: 2 }
  return boxSolid(plan, SOURCE_Z, BOX_H, 'carried')
}

function sourceBoxArt() {
  const plan = { x: SOURCE_X - BOX_W / 2, y: WORKER_Y - BOX_D / 2, w: BOX_W, d: BOX_D, r: 2 }
  return boxSolid(plan, SOURCE_Z, BOX_H, 'source')
}

function stackArt() {
  const bottom = { x: STACK.x, y: STACK.y, w: STACK.w, d: STACK.d, r: 3 }
  return (
    <g key="stack">
      <Solid paths={solid(bottom, 0, 34, 4, 0.8)} tone="hi" crease="lo" className="part-card" />
      <Line
        d={k.lineOnTop([bottom.x + 5, bottom.y + bottom.d / 2], [bottom.x + bottom.w - 5, bottom.y + bottom.d / 2], 34.2, P)}
        tone="faint"
      />
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

function setShift(node, shift) {
  if (!node) return
  node.setAttribute('transform', `translate(${shift[0].toFixed(2)} ${shift[1].toFixed(2)})`)
}

function setOpacity(node, value) {
  if (node) node.setAttribute('opacity', clamp(value).toFixed(3))
}

export function LifterStage({ className = '' }) {
  const reduced = useReducedMotion()
  const stage = useRef(null)
  const actor = useRef(null)
  const shadow = useRef(null)
  const body = useRef(null)
  const farThigh = useRef(null)
  const farShin = useRef(null)
  const nearThigh = useRef(null)
  const nearShin = useRef(null)
  const farShoe = useRef(null)
  const nearShoe = useRef(null)
  const farUpper = useRef(null)
  const farLower = useRef(null)
  const nearUpper = useRef(null)
  const nearLower = useRef(null)
  const farHand = useRef(null)
  const nearHand = useRef(null)
  const box = useRef(null)
  const sourceBox = useRef(null)
  const bedBoxes = useRef([])
  const clock = useRef(0)
  const inView = useInView(stage, { margin: '160px 0px' })
  const ready = useRef(false)

  const apply = (state) => {
    if (actor.current) actor.current.setAttribute('opacity', '1')
    setShift(shadow.current, state.shadowShift)
    if (body.current) body.current.setAttribute('transform', `translate(${state.bodyShift[0].toFixed(2)} ${state.bodyShift[1].toFixed(2)})`)
    setPath(farThigh.current, state.farThigh)
    setPath(farShin.current, state.farShin)
    setPath(nearThigh.current, state.nearThigh)
    setPath(nearShin.current, state.nearShin)
    setShift(farShoe.current, state.shoeFar)
    setShift(nearShoe.current, state.shoeNear)
    setPath(farUpper.current, state.farUpper)
    setPath(farLower.current, state.farLower)
    setPath(nearUpper.current, state.nearUpper)
    setPath(nearLower.current, state.nearLower)
    setXY(farHand.current, state.handFar[0], state.handFar[1])
    setXY(nearHand.current, state.handNear[0], state.handNear[1])
    setShift(box.current, state.boxShift)
    setOpacity(box.current, state.carried)
    setOpacity(sourceBox.current, state.source)
    state.bed.forEach((value, index) => setOpacity(bedBoxes.current[index], value))
    ready.current = true
  }

  useAnimationFrame((time, delta) => {
    if (!inView || reduced) return
    clock.current += delta / 1000
    if (clock.current > MASTER) clock.current -= MASTER
    apply(poseAt(clock.current))
  })

  useEffect(() => {
    if (!ready.current) apply(reduced ? poseAt(16.6) : INITIAL)
  }, [reduced])

  const restart = () => {
    if (reduced) return
    clock.current = 0
    apply(poseAt(0))
  }

  return (
    <div
      ref={stage}
      className={`fig-iso lifter-stage ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="Pekerja pria mengangkat kardus dengan lutut menekuk, membawanya ke bak mobil pickup, lalu kembali ke tumpukan. Tekan untuk mengulang gerakan."
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
        label="Pekerja memuat kardus ke bak Suzuki Carry Tayo hitam milik Lorong Hitam."
      >
        {contactShadow(38, TRUCK_Y, 198, 26, 0.46)}
        {contactShadow(STACK.x + STACK.w / 2, WORKER_Y, 44, 11, 0.38)}
        {pickupArt(bedBoxes)}
        {stackArt()}
        <g ref={sourceBox} opacity="1">
          {sourceBoxArt()}
        </g>

        <g ref={actor}>
          <g ref={shadow}>
            <ellipse className="fig-shadow" cx={0} cy={0} rx="48" ry="11" opacity="0.5" />
          </g>

          <g ref={farThigh}>
            <path className="trouser-outline" d={INITIAL.farThigh} />
            <path className="trouser-fill" d={INITIAL.farThigh} />
          </g>
          <g ref={farShin}>
            <path className="trouser-outline" d={INITIAL.farShin} />
            <path className="trouser-fill" d={INITIAL.farShin} />
            <path className="trouser-stripe" d={INITIAL.farShin} />
          </g>
          <g ref={farShoe} transform={`translate(${INITIAL.shoeFar[0].toFixed(2)} ${INITIAL.shoeFar[1].toFixed(2)})`}>
            {shoeArt(SHOE_FAR, SOLE_FAR, SHOE_TOE_FAR)}
          </g>

          <g ref={nearThigh}>
            <path className="trouser-outline" d={INITIAL.nearThigh} />
            <path className="trouser-fill" d={INITIAL.nearThigh} />
          </g>
          <g ref={nearShin}>
            <path className="trouser-outline" d={INITIAL.nearShin} />
            <path className="trouser-fill" d={INITIAL.nearShin} />
            <path className="trouser-stripe" d={INITIAL.nearShin} />
          </g>
          <g ref={nearShoe} transform={`translate(${INITIAL.shoeNear[0].toFixed(2)} ${INITIAL.shoeNear[1].toFixed(2)})`}>
            {shoeArt(SHOE_NEAR, SOLE_NEAR, SHOE_TOE_NEAR)}
          </g>

          <g ref={body} transform={`translate(${INITIAL.bodyShift[0].toFixed(2)} ${INITIAL.bodyShift[1].toFixed(2)})`}>
            {torsoArt()}
          </g>

          <g ref={farUpper}>
            <path className="sleeve-outline" d={INITIAL.farUpper} />
            <path className="sleeve-fill" d={INITIAL.farUpper} />
          </g>
          <g ref={farLower}>
            <path className="skin-outline" d={INITIAL.farLower} />
            <path className="skin-fill" d={INITIAL.farLower} />
          </g>
          <circle ref={farHand} className="worker-hand" cx={INITIAL.handFar[0]} cy={INITIAL.handFar[1]} r="4.8" />

          <g ref={box} transform={`translate(${INITIAL.boxShift[0].toFixed(2)} ${INITIAL.boxShift[1].toFixed(2)})`} opacity={INITIAL.carried}>
            {carriedBoxArt()}
          </g>

          <g ref={nearUpper}>
            <path className="sleeve-outline" d={INITIAL.nearUpper} />
            <path className="sleeve-fill" d={INITIAL.nearUpper} />
          </g>
          <g ref={nearLower}>
            <path className="skin-outline" d={INITIAL.nearLower} />
            <path className="skin-fill" d={INITIAL.nearLower} />
          </g>
          <circle ref={nearHand} className="worker-hand" cx={INITIAL.handNear[0]} cy={INITIAL.handNear[1]} r="4.8" />
        </g>
      </IsoFigure>
    </div>
  )
}

export default LifterStage
