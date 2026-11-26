import { useMemo } from 'react'
import { motion } from 'framer-motion'
import * as k from '../../anatomy/iso-kit.mjs'
import * as G from '../../anatomy/lathe.mjs'
import { Dots, FaceText, Line, Solid } from '../../anatomy/draw'
import { path3 } from '../iso'
import { DIM, bedBoxPlans } from './model'

const circlePoints = (cx, cy, cz, radius, steps = 40) =>
  Array.from({ length: steps }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2
    return [cx + Math.cos(angle) * radius, cy, cz + Math.sin(angle) * radius]
  })

function build(P) {
  const solid = (plan, z, h, steps = 5, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel)
  const panel = (points) => path3(P, points, true)
  const line = (a, b) => k.segment(a, b, P)
  const point = (value) => k.iso(value, P)
  const { bed, cab, wheel, front, chassis, box, halfWidth, cabHalf } = DIM
  const bedLength = bed.front - bed.rear
  const bedDepth = bed.half * 2

  const archNotch = (cx, zc, radius, y, bottom) => {
    if (bottom >= zc + radius) return ''
    const from = Math.asin(Math.max(-1, Math.min(1, (bottom - zc) / radius)))
    const points = []
    for (let index = 0; index <= 26; index += 1) {
      const angle = from + (Math.PI - 2 * from) * (index / 26)
      points.push([cx + Math.cos(angle) * radius, y, zc + Math.sin(angle) * radius])
    }
    return path3(P, points, true)
  }

  const archArc = (cx, zc, radius, y, bottom) => {
    if (bottom >= zc + radius) return ''
    const from = Math.asin(Math.max(-1, Math.min(1, (bottom - zc) / radius)))
    const points = []
    for (let index = 0; index <= 26; index += 1) {
      const angle = from + (Math.PI - 2 * from) * (index / 26)
      points.push([cx + Math.cos(angle) * radius, y, zc + Math.sin(angle) * radius])
    }
    return path3(P, points)
  }

  const chassisRails = [
    solid({ x: chassis.rear, y: chassis.railOuter, w: chassis.front - chassis.rear, d: 10, r: 1.5 }, chassis.bottom, chassis.top - chassis.bottom, 3, 0.3),
    solid({ x: chassis.rear, y: -chassis.railOuter, w: chassis.front - chassis.rear, d: 10, r: 1.5 }, chassis.bottom, chassis.top - chassis.bottom, 3, 0.3),
  ]
  const crossMembers = [-150, -110, 20, 120].map((x) =>
    solid({ x, y: -44, w: 12, d: 88, r: 1 }, 27, 6, 3, 0.2),
  )
  const under = solid({ x: bed.rear + 2, y: -60, w: 334, d: 120, r: 2 }, 42, 4, 4, 0.3)
  const fuel = solid({ x: -56, y: -58, w: 38, d: 22, r: 8 }, 30, 12, 6, 0.5)
  const exhaust = G.solidOf(
    [[0, 3], [26, 3]],
    G.frameAlong([-148, 44, 24], [-1, 0, 0]),
    P,
    { steps: 20 },
  )
  const axles = [
    G.solidOf([[0, 3.4], [148, 3.4]], G.frameAlong([wheel.rearX, -74, wheel.r], [0, 1, 0]), P, { steps: 20 }),
    G.solidOf([[0, 3.4], [148, 3.4]], G.frameAlong([wheel.frontX, -74, wheel.r], [0, 1, 0]), P, { steps: 20 }),
  ]
  const differential = G.sphereOf([wheel.rearX, 0, wheel.r - 1], 10, P, { steps: 36 })
  const springs = [
    solid({ x: -150, y: 48, w: 128, d: 7, r: 2 }, 20, 5, 3, 0.2),
    solid({ x: -150, y: -55, w: 128, d: 7, r: 2 }, 20, 5, 3, 0.2),
    solid({ x: 66, y: 48, w: 90, d: 7, r: 2 }, 20, 5, 3, 0.2),
    solid({ x: 66, y: -55, w: 90, d: 7, r: 2 }, 20, 5, 3, 0.2),
  ]

  const rearBumper = solid({ x: -181, y: -74, w: 9, d: 148, r: 3 }, 32, 14, 4, 0.8)
  const rearBrackets = [
    solid({ x: -176, y: 36, w: 10, d: 8, r: 1 }, 26, 8, 3, 0.2),
    solid({ x: -176, y: -44, w: 10, d: 8, r: 1 }, 26, 8, 3, 0.2),
  ]

  const bedFloor = solid({ x: bed.rear, y: -bed.half, w: bedLength, d: bedDepth, r: 3 }, bed.floor, bed.floorTop - bed.floor, 4, 0.5)
  const bedFar = solid({ x: bed.rear, y: -bed.half, w: bedLength, d: 6, r: 2 }, bed.panelBottom, bed.wallTop - bed.panelBottom, 4, 0.6)
  const bedTailgate = solid({ x: bed.rear, y: -bed.innerHalf, w: 6, d: bed.innerHalf * 2, r: 2 }, bed.panelBottom, bed.wallTop - bed.panelBottom, 4, 0.6)
  const tailgateCap = solid({ x: bed.rear, y: -bed.innerHalf, w: 6, d: bed.innerHalf * 2, r: 2 }, bed.wallTop, 3, 3, 0.4)
  const headboard = solid({ x: bed.innerFront, y: -bed.innerHalf, w: 6, d: bed.innerHalf * 2, r: 2 }, bed.panelBottom, bed.headboardTop - bed.panelBottom, 4, 0.6)
  const headboardCap = solid({ x: bed.innerFront, y: -bed.innerHalf, w: 6, d: bed.innerHalf * 2, r: 2 }, bed.headboardTop, 2, 3, 0.3)
  const bedNear = solid({ x: bed.rear, y: bed.innerHalf, w: bedLength, d: 6, r: 2 }, bed.panelBottom, bed.wallTop - bed.panelBottom, 4, 0.7)
  const bedRail = solid({ x: bed.rear, y: bed.innerHalf - 1, w: bedLength, d: 8, r: 2 }, bed.wallTop, 3, 3, 0.5)

  const bedSeams = [
    line([-120, bed.half + 0.4, 52], [-120, bed.half + 0.4, 97]),
    line([-70, bed.half + 0.4, 52], [-70, bed.half + 0.4, 97]),
    line([-20, bed.half + 0.4, 52], [-20, bed.half + 0.4, 97]),
    line([bed.innerRear + 4, bed.half + 0.4, 52], [bed.innerFront - 4, bed.half + 0.4, 52]),
    line([bed.innerRear + 4, bed.half + 0.4, 96], [bed.innerFront - 4, bed.half + 0.4, 96]),
  ]
  const hinges = [-88, -34, 20].map((x) => solid({ x, y: bed.half - 1, w: 11, d: 3, r: 1 }, 40, 4, 3, 0.2))
  const latches = [-140, -60].map((x) => solid({ x, y: bed.half - 0.4, w: 9, d: 2.4, r: 1 }, 91, 5, 3, 0.3))
  const fuelCap = solid({ x: -28, y: bed.half - 0.6, w: 9, d: 1.6, r: 4.4 }, 84, 9, 8, 0.4)
  const tailRed = solid({ x: -170, y: bed.half - 1.4, w: 15, d: 2.4, r: 1.4 }, 66, 18, 3, 0.3)
  const tailAmber = solid({ x: -170, y: bed.half - 1.4, w: 15, d: 2, r: 1.2 }, 60, 6, 3, 0.2)
  const tailReverse = solid({ x: -153, y: bed.half - 1.4, w: 6, d: 2, r: 1 }, 67, 7, 3, 0.2)

  const cargoBoxes = bedBoxPlans().map((plan) => ({
    plan,
    body: solid(plan, bed.floorTop, box.h, 4, 0.7),
    seam: line([plan.x + 3, plan.y + plan.d / 2 + 0.4, bed.floorTop + box.h], [plan.x + plan.w - 3, plan.y + plan.d / 2 + 0.4, bed.floorTop + box.h]),
    tapeTop: panel([
      [plan.x + plan.w / 2 - 3.4, plan.y + 1, bed.floorTop + box.h + 0.2],
      [plan.x + plan.w / 2 + 3.4, plan.y + 1, bed.floorTop + box.h + 0.2],
      [plan.x + plan.w / 2 + 3.4, plan.y + plan.d - 1, bed.floorTop + box.h + 0.2],
      [plan.x + plan.w / 2 - 3.4, plan.y + plan.d - 1, bed.floorTop + box.h + 0.2],
    ]),
    tapeSide: panel([
      [plan.x + plan.w / 2 - 3.4, plan.y + plan.d + 0.25, bed.floorTop + 3],
      [plan.x + plan.w / 2 + 3.4, plan.y + plan.d + 0.25, bed.floorTop + 3],
      [plan.x + plan.w / 2 + 3.4, plan.y + plan.d + 0.25, bed.floorTop + box.h - 3],
      [plan.x + plan.w / 2 - 3.4, plan.y + plan.d + 0.25, bed.floorTop + box.h - 3],
    ]),
  }))

  const ropePoints = [bed.half + 0.6, 46, 22, 0, -22, -46, -(bed.half + 0.6)]
  const ropeHeights = [102.5, 105, 106.2, 106.8, 106.2, 105, 102.5]
  const ropes = DIM.rope.map((x) =>
    path3(
      P,
      ropePoints.map((y, index) => [x, y, ropeHeights[index]]),
    ),
  )
  const ropeHooks = DIM.rope.map((x) => point([x, bed.half + 0.6, 64]))

  const cabLow = solid({ x: cab.x0, y: -halfWidth, w: cab.x1 - cab.x0, d: halfWidth * 2, r: 8 }, 38, cab.bodyTop - 38, 6, 1.2)
  const cabProfile = [
    [cab.x0, cab.bodyTop],
    [cab.x0, cab.rearTop],
    [cab.x0 + cab.rearChamfer, cab.upperTop],
    [cab.roofFront, cab.upperTop],
    [cab.frontTop, cab.upperTop - 4],
    [cab.x1, cab.bodyTop],
  ]
  const cabUpper = G.prismOf(
    G.frameAlong([0, 0, 0], [0, -1, 0]),
    cabProfile,
    -cabHalf,
    cabHalf,
    P,
  )
  const roofRibs = [
    line([cab.x0 + 10, -30, cab.upperTop + 0.3], [cab.roofFront - 8, -30, cab.upperTop + 0.3]),
    line([cab.x0 + 10, 30, cab.upperTop + 0.3], [cab.roofFront - 8, 30, cab.upperTop + 0.3]),
  ]
  const antenna = line([cab.x0 + 6, -46, cab.upperTop], [cab.x0 + 6, -50, cab.upperTop + 12])

  const frontPanel = solid({ x: front.panelX0, y: -cabHalf, w: front.panelX1 - front.panelX0, d: cabHalf * 2, r: 3 }, 42, cab.bodyTop - 42, 4, 0.6)

  const windshield = panel([
    [cab.windshieldBottom.x, -60, cab.windshieldBottom.z],
    [cab.windshieldBottom.x, 60, cab.windshieldBottom.z],
    [cab.windshieldTop.x, 60, cab.windshieldTop.z],
    [cab.windshieldTop.x, -60, cab.windshieldTop.z],
  ])
  const sideWindow = panel([
    [50, cabHalf + 0.35, 110],
    [155, cabHalf + 0.35, 110],
    [149, cabHalf + 0.35, 154],
    [50, cabHalf + 0.35, 154],
  ])
  const wipers = [
    line([165.2, -30, 112], [163.0, -6, 124]),
    line([165.2, 18, 112], [163.0, 42, 124]),
  ]

  const doorSeams = [
    line([44, halfWidth + 0.4, 42], [44, halfWidth + 0.4, 103]),
    line([150, halfWidth + 0.4, 42], [150, halfWidth + 0.4, 103]),
    line([38, halfWidth + 0.4, 104], [cab.x1, halfWidth + 0.4, 104]),
    line([46, halfWidth + 0.4, 44], [148, halfWidth + 0.4, 44]),
  ]
  const handle = solid({ x: 118, y: halfWidth - 0.2, w: 15, d: 2.2, r: 1 }, 90, 4, 3, 0.3)
  const step = solid({ x: 46, y: cabHalf, w: 40, d: 14, r: 2 }, 22, 4, 3, 0.4)
  const stepBracket = solid({ x: 58, y: 62, w: 6, d: 8, r: 1 }, 24, 16, 3, 0.2)
  const mirrorArm = solid({ x: 157, y: cabHalf, w: 5, d: 18, r: 1.2 }, 136, 2.6, 3, 0.2)
  const mirrorHead = solid({ x: 155, y: cabHalf + 18, w: 12, d: 5, r: 2.4 }, 126, 15, 4, 0.4)
  const mirrorGlass = panel([
    [167.3, cabHalf + 18.6, 128],
    [167.3, cabHalf + 22.4, 128],
    [167.3, cabHalf + 22.4, 139],
    [167.3, cabHalf + 18.6, 139],
  ])

  const grille = panel([
    [front.panelX1, -26, 94],
    [front.panelX1, 26, 94],
    [front.panelX1, 26, 62],
    [front.panelX1, -26, 62],
  ])
  const grilleSlats = [69, 75, 81, 87].map((z) => line([front.panelX1 + 0.35, -23, z], [front.panelX1 + 0.35, 23, z]))
  const badge = panel([
    [front.panelX1 + 0.4, -6, 93],
    [front.panelX1 + 0.4, 6, 93],
    [front.panelX1 + 0.4, 6, 84],
    [front.panelX1 + 0.4, -6, 84],
  ])
  const frontMatrix = (y, z) => {
    const origin = point([front.panelX1 + 0.6, y, z])
    const along = point([front.panelX1 + 0.6, y + 1, z])
    const down = point([front.panelX1 + 0.6, y, z - 1])
    const round = (value) => Math.round(value * 1000) / 1000
    return `matrix(${round(along[0] - origin[0])} ${round(along[1] - origin[1])} ${round(down[0] - origin[0])} ${round(down[1] - origin[1])} ${round(origin[0])} ${round(origin[1])})`
  }

  const headlampLines = [line([front.panelX1 + 2.6, 30, 82], [front.panelX1 + 2.6, 60, 82]), line([front.panelX1 + 2.6, -60, 82], [front.panelX1 + 2.6, -30, 82])]
  const headlamps = [
    solid({ x: front.panelX1, y: 28, w: 2.4, d: 34, r: 1.2 }, 70, 24, 4, 0.5),
    solid({ x: front.panelX1, y: -62, w: 2.4, d: 34, r: 1.2 }, 70, 24, 4, 0.5),
  ]
  const indicators = [
    solid({ x: front.panelX1, y: 30, w: 1.6, d: 22, r: 1 }, 60, 8, 3, 0.3),
    solid({ x: front.panelX1, y: -52, w: 1.6, d: 22, r: 1 }, 60, 8, 3, 0.3),
  ]
  const frontBumper = solid({ x: front.bumperX0, y: -halfWidth, w: front.bumperX1 - front.bumperX0, d: halfWidth * 2, r: 4 }, front.bumperBottom, front.bumperTop - front.bumperBottom, 4, 0.8)
  const bumperSlots = [
    line([front.bumperX1 + 0.3, -52, 48], [front.bumperX1 + 0.3, -20, 48]),
    line([front.bumperX1 + 0.3, 20, 48], [front.bumperX1 + 0.3, 52, 48]),
  ]
  const plate = panel([
    [front.bumperX1 + 0.4, -16, 52],
    [front.bumperX1 + 0.4, 16, 52],
    [front.bumperX1 + 0.4, 16, 42],
    [front.bumperX1 + 0.4, -16, 42],
  ])
  const plateLines = [line([front.bumperX1 + 0.6, -12, 48], [front.bumperX1 + 0.6, 12, 48]), line([front.bumperX1 + 0.6, -12, 45], [front.bumperX1 + 0.6, 8, 45])]

  const wheelOf = (x, near) => {
    const { r, innerY, outerY } = wheel
    const width = outerY - innerY
    const dir = near ? 1 : -1
    const startY = near ? innerY : -outerY
    const faceY = near ? outerY : -outerY
    const frame = G.frameAlong([x, startY, r], [0, dir, 0])
    const tyre = G.solidOf(
      [[2.2, r - 2.2], [4.5, r], [width - 4.5, r], [width - 2.2, r - 2.2]],
      frame,
      P,
      { steps: 48 },
    )
    const sidewall = k.sideRing([x, faceY, r], r - 7, 'y', P, 44)
    const rim = path3(P, circlePoints(x, faceY, r, r - 8, 44), true)
    const rimRing = k.sideRing([x, faceY, r], r - 8, 'y', P, 44)
    const hub = path3(P, circlePoints(x, faceY, r, 6.2, 28), true)
    const hubRing = k.sideRing([x, faceY, r], 6.2, 'y', P, 28)
    const centre = point([x, faceY, r])
    const bolts = [0, 90, 180, 270].map((angle) =>
      point([x + Math.cos((angle * Math.PI) / 180) * 9, faceY, r + Math.sin((angle * Math.PI) / 180) * 9]),
    )
    const vents = [45, 135, 225, 315].map((angle) => {
      const a = (angle * Math.PI) / 180
      return [
        point([x + Math.cos(a) * 11, faceY, r + Math.sin(a) * 11]),
        point([x + Math.cos(a) * 16, faceY, r + Math.sin(a) * 16]),
      ]
    })
    return { tyre, sidewall, rim, rimRing, hub, hubRing, centre, bolts, vents }
  }

  const wheels = {
    rear: { far: wheelOf(wheel.rearX, false), near: wheelOf(wheel.rearX, true) },
    front: { far: wheelOf(wheel.frontX, false), near: wheelOf(wheel.frontX, true) },
  }

  return {
    chassisRails,
    crossMembers,
    under,
    fuel,
    exhaust,
    axles,
    differential,
    springs,
    rearBumper,
    rearBrackets,
    bedFloor,
    bedFar,
    bedTailgate,
    tailgateCap,
    headboard,
    headboardCap,
    bedNear,
    bedRail,
    bedSeams,
    hinges,
    latches,
    fuelCap,
    tailRed,
    tailAmber,
    tailReverse,
    cargoBoxes,
    ropes,
    ropeHooks,
    cabLow,
    cabUpper,
    roofRibs,
    antenna,
    frontPanel,
    windshield,
    sideWindow,
    wipers,
    doorSeams,
    handle,
    step,
    stepBracket,
    mirrorArm,
    mirrorHead,
    mirrorGlass,
    grille,
    grilleSlats,
    badge,
    badgeText: frontMatrix(0, 84.5),
    headlamps,
    headlampLines,
    indicators,
    frontBumper,
    bumperSlots,
    plate,
    plateLines,
    wheels,
    bedArch: {
      notch: archNotch(wheel.rearX, wheel.r, wheel.arch, bed.half + 0.4, bed.panelBottom),
      lip: archArc(wheel.rearX, wheel.r, wheel.lip, bed.half + 0.45, bed.panelBottom),
    },
    cabArch: {
      notch: archNotch(wheel.frontX, wheel.r, wheel.arch, halfWidth + 0.4, 38),
      lip: archArc(wheel.frontX, wheel.r, wheel.lip, halfWidth + 0.45, 38),
    },
  }
}

function Wheel({ parts, near, driving, reduced }) {
  const spin = !reduced && driving
  return (
    <g>
      <Solid paths={parts.tyre} tone="lo" crease="faint" className="part-tyre" />
      <Line d={parts.sidewall} tone="faint" />
      {near ? (
        <>
          <path className="iso-fill part-rim" d={parts.rim} />
          <path className="iso-line" data-tone="lo" d={parts.rimRing} />
          <path className="iso-fill part-rim" d={parts.hub} />
          <path className="iso-line" data-tone="mid" d={parts.hubRing} />
          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={spin ? { rotate: [0, 360] } : { rotate: 0 }}
            transition={spin ? { repeat: Infinity, duration: 1.05, ease: 'linear' } : { duration: 0.3 }}
          >
            {parts.vents.map(([from, to], index) => (
              <line
                key={`vent${index}`}
                x1={from[0]}
                y1={from[1]}
                x2={to[0]}
                y2={to[1]}
                stroke="var(--anatomy-hi)"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.45"
              />
            ))}
            {parts.bolts.map(([bx, by], index) => (
              <circle key={`bolt${index}`} cx={bx} cy={by} r="1.7" fill="var(--fig-ink)" opacity="0.85" />
            ))}
          </motion.g>
          <circle cx={parts.centre[0]} cy={parts.centre[1]} r="2.6" fill="var(--fig-ink)" />
        </>
      ) : (
        <circle cx={parts.centre[0]} cy={parts.centre[1]} r="2" fill="var(--anatomy-lo)" opacity="0.45" />
      )}
    </g>
  )
}

export function TruckBody({ P, driving = false, reduced = true, cargo = false, bedChildren = null, brand = 'LH' }) {
  const parts = useMemo(() => build(P), [P])
  const lit = driving ? '' : undefined

  return (
    <g className="truck-body">
      <Wheel parts={parts.wheels.rear.far} near={false} driving={driving} reduced={reduced} />
      <Wheel parts={parts.wheels.front.far} near={false} driving={driving} reduced={reduced} />

      {parts.rearBumper ? <Solid paths={parts.rearBumper} tone="mid" crease="faint" className="part-metal" /> : null}
      {parts.rearBrackets.map((paths, index) => (
        <Solid key={`rb${index}`} paths={paths} tone="lo" crease="faint" className="part-ink" />
      ))}

      {parts.chassisRails.map((paths, index) => (
        <Solid key={`rail${index}`} paths={paths} tone="mid" crease="faint" className="part-ink" />
      ))}
      {parts.crossMembers.map((paths, index) => (
        <Solid key={`cross${index}`} paths={paths} tone="lo" crease="faint" className="part-ink" />
      ))}
      <Solid paths={parts.under} tone="lo" crease="faint" className="part-ink" />
      <Solid paths={parts.fuel} tone="mid" crease="faint" className="part-ink" />
      <Solid paths={parts.exhaust} tone="mid" crease="none" className="part-metal" />
      {parts.axles.map((paths, index) => (
        <Solid key={`axle${index}`} paths={paths} tone="lo" crease="none" className="part-ink" />
      ))}
      <Solid paths={parts.differential} tone="lo" crease="none" className="part-ink" />
      {parts.springs.map((paths, index) => (
        <Solid key={`spring${index}`} paths={paths} tone="lo" crease="faint" className="part-ink" />
      ))}

      <Solid paths={parts.bedFloor} tone="mid" crease="faint" className="part-brand" />
      <Solid paths={parts.bedFar} tone="lo" crease="faint" className="part-brand" />
      <Solid paths={parts.bedTailgate} tone="mid" crease="faint" className="part-brand" />
      <Solid paths={parts.tailgateCap} tone="hi" crease="faint" className="part-brand" />
      <Solid paths={parts.headboard} tone="mid" crease="faint" className="part-brand" />
      <Solid paths={parts.headboardCap} tone="mid" crease="faint" className="part-brand" />

      {cargo ? parts.cargoBoxes.map((boxPart, index) => (
        <g key={`cargo${index}`}>
          <Solid paths={boxPart.body} tone="hi" crease="lo" className="part-card" />
          <Line d={boxPart.seam} tone="faint" />
          <path className="iso-fill pickup-tape" d={boxPart.tapeTop} />
          <path className="iso-fill pickup-tape" d={boxPart.tapeSide} />
        </g>
      )) : null}
      {bedChildren}

      <Solid paths={parts.bedNear} tone="hi" crease="faint" className="part-brand" />
      <Solid paths={parts.bedRail} tone="hi" crease="faint" className="part-brand" />
      <Line d={parts.bedSeams.join('')} tone="faint" />
      {parts.hinges.map((paths, index) => (
        <Solid key={`hinge${index}`} paths={paths} tone="mid" crease="faint" className="part-metal" />
      ))}
      {parts.latches.map((paths, index) => (
        <Solid key={`latch${index}`} paths={paths} tone="mid" crease="faint" className="part-metal" />
      ))}
      <Solid paths={parts.fuelCap} tone="mid" crease="faint" className="part-metal" />

      <g className="pickup-red" data-lit={lit}>
        <Solid paths={parts.tailRed} tone="mid" crease="faint" />
      </g>
      <g className="pickup-amber" data-lit={lit}>
        <Solid paths={parts.tailAmber} tone="mid" crease="faint" />
      </g>
      <g className="pickup-lamp">
        <Solid paths={parts.tailReverse} tone="mid" crease="faint" />
      </g>

      {cargo ? parts.ropes.map((d, index) => (
        <Line key={`rope${index}`} d={d} className="pickup-rope" free />
      )) : null}
      {cargo ? <Dots points={parts.ropeHooks} size={1.1} tone="lo" /> : null}

      <path className="iso-fill arch-dark" d={parts.bedArch.notch} />
      <Line d={parts.bedArch.lip} tone="faint" />

      <Solid paths={parts.cabLow} tone="hi" crease="lo" className="part-brand" />
      <Solid paths={parts.cabUpper} tone="hi" crease="lo" className="part-brand" />
      <Line d={parts.roofRibs.join('')} tone="faint" />
      <Line d={parts.antenna} tone="mid" />
      <Solid paths={parts.frontPanel} tone="hi" crease="faint" className="part-brand" />

      <g className="part-glass">
        <path className="iso-fill" d={parts.windshield} />
        <path className="iso-line" data-tone="lo" d={parts.windshield} />
        <path className="iso-fill" d={parts.sideWindow} />
        <path className="iso-line" data-tone="lo" d={parts.sideWindow} />
      </g>
      <Line d={parts.wipers.join('')} tone="faint" />
      <Line d={parts.doorSeams.join('')} tone="faint" />
      <Solid paths={parts.handle} tone="mid" crease="faint" className="part-metal" />
      <Solid paths={parts.step} tone="mid" crease="faint" className="part-ink" />
      <Solid paths={parts.stepBracket} tone="lo" crease="faint" className="part-ink" />
      <Solid paths={parts.mirrorArm} tone="mid" crease="faint" className="part-ink" />
      <Solid paths={parts.mirrorHead} tone="mid" crease="faint" className="part-ink" />
      <path className="iso-fill part-glass" d={parts.mirrorGlass} />

      <FaceText transform={k.sideMatrix([60, DIM.halfWidth + 0.55], 90, P, 'left')} size={20} tone="hi" className="brand-text">
        {brand}
      </FaceText>
      <FaceText transform={k.sideMatrix([60, DIM.halfWidth + 0.55], 76, P, 'left')} size={7} tone="hi" className="brand-text brand-sub">
        EXPRESS
      </FaceText>
      <FaceText transform={k.sideMatrix([122, DIM.halfWidth + 0.55], 80, P, 'left')} size={5} tone="hi" className="brand-text brand-sub">
        CARRY
      </FaceText>

      <g className="part-ink">
        <path className="iso-fill" d={parts.grille} />
        <path className="iso-line" data-tone="hi" d={parts.grille} />
        <Line d={parts.grilleSlats.join('')} tone="mid" />
      </g>
      <g className="part-metal">
        <path className="iso-fill" d={parts.badge} />
        <path className="iso-line" data-tone="lo" d={parts.badge} />
        <FaceText transform={parts.badgeText} size={7} tone="hi" anchor="middle">
          S
        </FaceText>
      </g>

      <g className="pickup-lamp" data-lit={lit}>
        {parts.headlamps.map((paths, index) => (
          <Solid key={`lamp${index}`} paths={paths} tone="mid" crease="faint" />
        ))}
      </g>
      <g className="pickup-amber" data-lit={lit}>
        {parts.indicators.map((paths, index) => (
          <Solid key={`ind${index}`} paths={paths} tone="mid" crease="faint" />
        ))}
      </g>
      <Line d={parts.headlampLines.join('')} tone="mid" />

      <Solid paths={parts.frontBumper} tone="mid" crease="faint" className="part-ink" />
      <Line d={parts.bumperSlots.join('')} tone="mid" />
      <g className="part-paper">
        <path className="iso-fill" d={parts.plate} />
        <path className="iso-line" data-tone="lo" d={parts.plate} />
      </g>
      <Line d={parts.plateLines.join('')} tone="mid" free />

      <path className="iso-fill arch-dark" d={parts.cabArch.notch} />
      <Line d={parts.cabArch.lip} tone="faint" />

      <Wheel parts={parts.wheels.rear.near} near driving={driving} reduced={reduced} />
      <Wheel parts={parts.wheels.front.near} near driving={driving} reduced={reduced} />
    </g>
  )
}

export default TruckBody
