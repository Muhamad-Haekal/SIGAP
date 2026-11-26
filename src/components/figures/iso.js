import * as k from '../anatomy/iso-kit.mjs'

export { k }

export const at = (P) => (point) => k.iso(point, P)

export const path3 = (P, points, closed = false) =>
  k.pathOf(
    points.map((point) => k.iso(point, P)),
    closed,
  )

export const segment3 = (P, from, to) => k.segment(from, to, P)

export const byDepth = (P, points, z = 0) =>
  [...points].sort(
    (a, b) => k.depthOf([a[0], a[1], z], P) - k.depthOf([b[0], b[1], z], P),
  )

export const join = (lines) => lines.filter(Boolean).join('')

export function fit(points, width, height, options = {}) {
  return k.fitProjection(points, width, height, options)
}

export function corners(plan, z0, z1, inset = 0) {
  return k.boxCorners(inset ? k.insetPlan(plan, inset) : plan, z0, z1)
}

export function screenPoint(P, point) {
  return k.iso(point, P)
}

export function worldToScreenOffset(P, delta) {
  const origin = k.iso([0, 0, 0], P)
  const moved = k.iso(delta, P)
  return [moved[0] - origin[0], moved[1] - origin[1]]
}

export function rotateAround(element, [cx, cy], angle) {
  if (!element) return
  element.setAttribute('transform', `rotate(${angle.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)})`)
}

export function elbowOf(shoulder, hand, upper, lower, bend = 1) {
  const [sx, sy] = shoulder
  const [hx, hy] = hand
  const dx = hx - sx
  const dy = hy - sy
  const distance = Math.hypot(dx, dy) || 0.001
  const reach = Math.min(upper + lower - 0.2, Math.max(Math.abs(upper - lower) + 0.2, distance))
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach)
  const height = Math.sqrt(Math.max(0, upper * upper - along * along))
  const ux = dx / distance
  const uy = dy / distance
  return [
    sx + ux * along - uy * height * bend,
    sy + uy * along + ux * height * bend,
  ]
}

export function capsulePath(points) {
  if (!points.length) return ''
  return points
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join('')
}
