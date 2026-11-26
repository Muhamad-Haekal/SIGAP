import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IsoFigure } from '../anatomy/draw'
import { at, fit } from './iso'
import { TruckBody } from './truck/art'
import { DIM, truckFitPoints } from './truck/model'

export const WIDTH = 760
export const HEIGHT = 460

const P = fit(truckFitPoints(), WIDTH, HEIGHT, {
  pad: 24,
  headroom: 2,
  azimuth: 38,
  elevation: 20,
})

const point = at(P)
const { rearX, frontX, outerY } = DIM.wheel

function wheelShadow(x, y) {
  const center = point([x, y, 0])
  return (
    <ellipse
      className="wheel-shadow"
      cx={center[0]}
      cy={center[1] + 4}
      rx="32"
      ry="7"
      opacity="0.55"
    />
  )
}

export function PickupStage({ className = '' }) {
  const reduced = useReducedMotion()
  const [driving, setDriving] = useState(false)

  const begin = () => {
    if (!reduced) setDriving(true)
  }
  const stop = () => setDriving(false)

  return (
    <div
      className={`fig-iso pickup-stage ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-pressed={driving}
      aria-label="Mobil pickup Suzuki Carry hitam milik Lorong Hitam Express dengan tiga kardus terikat di bak terbuka. Tekan atau arahkan kursor untuk menjalankan pickup."
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') begin()
      }}
      onPointerLeave={stop}
      onPointerDown={(event) => {
        event.currentTarget.focus()
        setDriving((value) => !value)
      }}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          setDriving((value) => !value)
        }
        if (event.key === 'Escape') setDriving(false)
      }}
      data-driving={driving ? '' : undefined}
    >
      <IsoFigure
        width={WIDTH}
        height={HEIGHT}
        label="Ilustrasi isometrik Suzuki Carry hitam dengan kabin tunggal, bak terbuka berisi kardus terikat, detail grill, lampu, roda empat baut, dan identitas Lorong Hitam Express."
      >
        <ellipse
          className="fig-shadow"
          cx={point([-2, 0, 0])[0]}
          cy={point([-2, 0, 0])[1] + 10}
          rx="240"
          ry="36"
          opacity="0.62"
        />
        <ellipse
          className="fig-shadow"
          cx={point([-2, 0, 0])[0]}
          cy={point([-2, 0, 0])[1] + 14}
          rx="178"
          ry="24"
          opacity="0.3"
        />

        <motion.g
          animate={reduced ? undefined : driving ? { x: [0, 3.4, 0] } : { x: 0 }}
          transition={
            reduced
              ? undefined
              : driving
                ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
                : { duration: 0.35 }
          }
        >
          {wheelShadow(rearX, -outerY + 10)}
          {wheelShadow(frontX, -outerY + 10)}
          {wheelShadow(rearX, outerY - 10)}
          {wheelShadow(frontX, outerY - 10)}

          <motion.g
            animate={reduced ? undefined : driving ? { y: [0, -1.5, 0, 0.9, 0] } : { y: 0 }}
            transition={
              reduced
                ? undefined
                : driving
                  ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
                  : { duration: 0.4 }
            }
          >
            <TruckBody P={P} driving={driving} reduced={reduced} cargo />
          </motion.g>
        </motion.g>
      </IsoFigure>
    </div>
  )
}

export default PickupStage
