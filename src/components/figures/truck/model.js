export const DIM = {
  halfWidth: 72,
  cabHalf: 70,
  mirrorY: 92,
  roof: 165,
  bed: {
    rear: -172,
    front: 32,
    innerRear: -166,
    innerFront: 26,
    half: 72,
    innerHalf: 66,
    wall: 6,
    floor: 62,
    floorTop: 68,
    panelBottom: 38,
    wallTop: 99,
    railTop: 102,
    headboardTop: 106,
  },
  cab: {
    x0: 36,
    x1: 166,
    bodyTop: 104,
    rearTop: 158,
    rearChamfer: 4,
    roofFront: 152,
    frontTop: 156,
    upperTop: 162,
    roofTop: 165,
    windshieldBottom: { x: 165.7, z: 108 },
    windshieldTop: { x: 157.0, z: 156 },
  },
  front: {
    panelX0: 166,
    panelX1: 172,
    bumperX0: 172,
    bumperX1: 182,
    bumperBottom: 40,
    bumperTop: 56,
  },
  wheel: {
    r: 25,
    innerY: 56,
    outerY: 74,
    frontX: 128,
    rearX: -134,
    arch: 28,
    lip: 29.5,
  },
  chassis: {
    rear: -178,
    front: 166,
    railOuter: 54,
    railInner: 44,
    bottom: 26,
    top: 36,
  },
  slots: [-128, -82, -36],
  box: { w: 44, d: 40, h: 36 },
  rope: [-110, -56],
}

export const BED_BOX_BOTTOM = DIM.bed.floorTop
export const BED_BOX_CENTER = BED_BOX_BOTTOM + DIM.box.h / 2

const boxPoints = (x0, x1, y0, y1, z0, z1) => {
  const out = []
  for (const x of [x0, x1]) {
    for (const y of [y0, y1]) {
      for (const z of [z0, z1]) out.push([x, y, z])
    }
  }
  return out
}

export function truckFitPoints(centerY = 0) {
  const { bed, cab, wheel, front, chassis, box, slots, halfWidth, mirrorY, roof } = DIM
  const points = [
    ...boxPoints(chassis.rear, front.bumperX1, -halfWidth, halfWidth, 0, roof),
    ...boxPoints(bed.rear, bed.front, -bed.half, bed.half, 0, bed.railTop),
    ...boxPoints(cab.x0, front.panelX1, -halfWidth, halfWidth, 0, roof),
    ...boxPoints(wheel.rearX - wheel.arch, wheel.frontX + wheel.arch, -mirrorY, mirrorY, 0, wheel.r * 2),
    ...boxPoints(
      slots[0] - box.w / 2,
      slots[slots.length - 1] + box.w / 2,
      -box.d / 2,
      box.d / 2,
      bed.floorTop,
      bed.floorTop + box.h + 6,
    ),
  ]
  return centerY ? points.map(([x, y, z]) => [x, y + centerY, z]) : points
}

export function bedBoxPlans() {
  const { box, slots } = DIM
  return slots.map((slot) => ({
    x: slot - box.w / 2,
    y: -box.d / 2,
    w: box.w,
    d: box.d,
    r: 2,
  }))
}
