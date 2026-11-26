export function Solid({
  paths,
  tone = 'hi',
  crease = 'faint',
  halo = false,
  lit = false,
  flat = false,
  className,
  inner,
  children,
  ...rest
}) {
  if (!paths) return null
  return (
    <g
      className={className ? `iso-solid ${className}` : 'iso-solid'}
      data-lit={lit ? '' : undefined}
      data-seamless={paths.seamless ? '' : undefined}
      {...rest}
    >
      {halo ? <path className="iso-halo" d={paths.fill} /> : null}
      <path className="iso-fill" d={paths.fill} />
      {flat
        ? null
        : paths.shades.map((d, shade) =>
            d ? <path key={shade} className="iso-shade" data-shade={shade} d={d} /> : null,
          )}
      {flat ? null : <path className="iso-top" d={paths.top} />}
      {crease === 'none' || !paths.crease ? null : (
        <path className="iso-line iso-crease" data-tone={crease} d={paths.crease} />
      )}
      {crease === 'none' || !paths.bevel ? null : (
        <path className="iso-line iso-bevel" data-tone={crease} d={paths.bevel} />
      )}
      {inner}
      <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
      {children}
    </g>
  )
}

export function Line({ d, tone = 'lo', dotted = false, dashed = false, flow = false, className, free }) {
  if (!d) return null
  return (
    <path
      className={className ? `iso-line ${className}` : 'iso-line'}
      data-tone={tone}
      data-dotted={dotted ? '' : undefined}
      data-dashed={dashed ? '' : undefined}
      data-flow={flow ? '' : undefined}
      data-free={free === true ? '' : free || undefined}
      d={d}
    />
  )
}

export function Dots({ points, size = 0.5, tone = 'mid', pulse = false }) {
  return (
    <g className="iso-dots" data-tone={tone}>
      {points.map(([x, y, alpha], index) => (
        <circle
          key={index}
          cx={Math.round(x * 10) / 10}
          cy={Math.round(y * 10) / 10}
          r={size}
          fillOpacity={alpha !== undefined && alpha < 1 ? Math.max(0, alpha) : undefined}
          data-pulse={pulse ? '' : undefined}
          style={pulse ? { '--pulse-at': `${(index * 137) % 1600}ms` } : undefined}
        />
      ))}
    </g>
  )
}

export function FaceText({ transform, children, size = 3, tone = 'mid', anchor = 'start', className }) {
  return (
    <text
      className={className ? `iso-face-text ${className}` : 'iso-face-text'}
      data-tone={tone}
      transform={transform}
      fontSize={size}
      textAnchor={anchor}
    >
      {children}
    </text>
  )
}

export function IsoFigure({ width, height, label, className, children }) {
  return (
    <div className={className ? `iso-stage ${className}` : 'iso-stage'}>
      <svg
        className="iso-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        focusable="false"
      >
        {children}
      </svg>
    </div>
  )
}
