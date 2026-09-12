import { motion, useReducedMotion } from 'framer-motion'

const ROTATE_BOX = { transformBox: 'fill-box', transformOrigin: 'center' }

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1]
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]

export default function HeroScene() {
  const reduced = useReducedMotion()

  return (
    <svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="presentation">
      {/* road backdrop */}
      <motion.g
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduced ? undefined : { duration: 0.5, ease: 'easeOut' }}
      >
        <rect x="0" y="336" width="640" height="64" fill="#FBDFC5" />
        <motion.line
          x1="0"
          y1="352"
          x2="640"
          y2="352"
          stroke="#D99C63"
          strokeWidth="4"
          strokeDasharray="16 14"
          animate={reduced ? undefined : { x: [0, -30] }}
          transition={reduced ? undefined : { repeat: Infinity, duration: 1.1, ease: 'linear', delay: 0.15 }}
        />
      </motion.g>

      {/* ===== ANGKAT BARANG — kurir berdiri mandiri mengangkat koli besar, tengah kanvas ===== */}
      <motion.g
        initial={reduced ? undefined : { y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduced
            ? undefined
            : {
                y: { duration: 0.6, delay: 0.5, ease: EASE_OUT_QUINT },
                opacity: { duration: 0.4, delay: 0.5 },
              }
        }
      >
        {/* shadow */}
        <ellipse cx="390" cy="353" rx="40" ry="5" fill="rgba(0,0,0,0.10)" />

        {/* kotak besar diangkat — bergerak naik-turun */}
        <motion.g
          animate={reduced ? undefined : { y: [0, -11, -11, 0, 0] }}
          transition={
            reduced
              ? undefined
              : {
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  duration: 4.2,
                  times: [0, 0.18, 0.52, 0.72, 1],
                  ease: [EASE_OUT_QUINT, 'easeInOut', [0.55, 0, 0.55, 0.2], 'easeInOut'],
                  delay: 1.0,
                }
          }
        >
          {/* tubuh */}
          <circle cx="390" cy="252" r="16" fill="#2E241C" />
          <rect x="372" y="268" width="36" height="44" rx="11" fill="#B8460B" />
          {/* lengan kiri terentang ke bawah-depan */}
          <path d="M372 278 q-18 8 -16 30" stroke="#B8460B" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* lengan kanan terentang ke bawah-depan */}
          <path d="M408 278 q18 8 16 30" stroke="#B8460B" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* kaki */}
          <rect x="373" y="312" width="13" height="36" rx="5" fill="#2E241C" />
          <rect x="404" y="312" width="13" height="36" rx="5" fill="#2E241C" />

          {/* kotak di tangan */}
          <rect x="354" y="280" width="72" height="52" rx="4" fill="#F2A25C" stroke="#A5622B" strokeWidth="2.5" />
          <path d="M354 298 H426" stroke="#A5622B" strokeWidth="2.5" />
          <path d="M390 280 V332" stroke="#A5622B" strokeWidth="2.5" />
        </motion.g>
      </motion.g>

      {/* ===== PACKING — kurir di meja, mengemas paket di kanan kanvas ===== */}
      <motion.g
        initial={reduced ? undefined : { y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduced
            ? undefined
            : {
                y: { duration: 0.65, delay: 0.7, ease: EASE_OUT_QUINT },
                opacity: { duration: 0.4, delay: 0.7 },
              }
        }
      >
        {/* shadow meja */}
        <ellipse cx="546" cy="353" rx="50" ry="5" fill="rgba(0,0,0,0.10)" />

        {/* kaki meja */}
        <rect x="506" y="310" width="9" height="40" fill="#C79A6E" />
        <rect x="581" y="310" width="9" height="40" fill="#C79A6E" />
        {/* permukaan meja */}
        <rect x="498" y="302" width="100" height="13" rx="3" fill="#E3B37E" />

        {/* kotak di atas meja */}
        <rect x="516" y="256" width="64" height="46" rx="3" fill="#F2A25C" stroke="#A5622B" strokeWidth="2.5" />
        <path d="M516 272 H580" stroke="#A5622B" strokeWidth="2.5" />
        <path d="M548 256 V302" stroke="#A5622B" strokeWidth="2.5" />

        {/* tape isolasi — gerak bolak-balik */}
        <motion.g
          animate={reduced ? undefined : { x: [0, 22, 22, 0, 0] }}
          transition={
            reduced
              ? undefined
              : {
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  duration: 3.8,
                  times: [0, 0.18, 0.50, 0.68, 1],
                  ease: [EASE_OUT_EXPO, 'easeInOut', 'easeInOut', 'easeInOut'],
                  delay: 1.8,
                }
          }
        >
          <rect x="530" y="249" width="36" height="10" rx="2" fill="#8C3608" />
        </motion.g>

        {/* kurir packing */}
        <circle cx="560" cy="253" r="15" fill="#2E241C" />
        <rect x="543" y="268" width="34" height="42" rx="10" fill="#EA580C" />
        {/* lengan ke depan mengarah ke meja */}
        <path d="M543 278 q-14 10 -12 26" stroke="#EA580C" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M577 278 q14 10 12 26" stroke="#EA580C" strokeWidth="13" strokeLinecap="round" fill="none" />
        {/* kaki */}
        <rect x="544" y="310" width="12" height="38" rx="5" fill="#2E241C" />
        <rect x="564" y="310" width="12" height="38" rx="5" fill="#2E241C" />
      </motion.g>

      {/* ===== PICKUP — truk ===== */}
      <motion.g
        initial={reduced ? undefined : { x: -190 }}
        animate={{ x: 0 }}
        transition={reduced ? undefined : { type: 'tween', duration: 1.25, delay: 0.12, ease: EASE_OUT_QUINT }}
      >
        {/* bodi: getar suspensi halus berjalan terus */}
        <motion.g
          style={ROTATE_BOX}
          animate={reduced ? undefined : { y: [0, -1.3, 0] }}
          transition={
            reduced ? undefined : { repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 2.2 }
          }
        >
          <rect x="26" y="272" width="128" height="52" rx="8" fill="#EA580C" />
          <rect x="26" y="272" width="128" height="14" rx="6" fill="#B8460B" />
          <path d="M154 324 V262 q0 -8 8 -8 h34 q8 0 13 7 l20 27 v36 z" fill="#B8460B" />
          <path d="M175 268 l14 20 h-22 v-16 q0 -4 4 -4 z" fill="#FBE3CE" />
          <rect x="222" y="296" width="10" height="10" rx="2" fill="#FBE3CE" />
          <rect x="18" y="300" width="10" height="16" rx="3" fill="#8C3608" />
          <rect x="40" y="322" width="170" height="8" rx="4" fill="#8C3608" />
        </motion.g>

        {/* roda: berputar terus */}
        <Wheel cx={70} cy={330} reduced={reduced} />
        <Wheel cx={182} cy={330} reduced={reduced} />
      </motion.g>
    </svg>
  )
}

function Wheel({ cx, cy, reduced }) {
  return (
    <>
      {/* base statis: ban + hubcap, tidak dianimasikan */}
      <circle cx={cx} cy={cy} r="19" fill="#2E241C" />
      <circle cx={cx} cy={cy} r="7" fill="#D9BE9F" />
      {/* indikator putar: SATU garis pendek, hanya ini yang berputar */}
      <motion.g
        style={ROTATE_BOX}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={reduced ? undefined : { repeat: Infinity, duration: 3.2, ease: 'linear', delay: 1.5 }}
      >
        <line
          x1={cx}
          y1={cy - 2}
          x2={cx}
          y2={cy - 6}
          stroke="#C79A6E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.g>
    </>
  )
}