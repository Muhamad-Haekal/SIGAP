import {
  ShieldIcon,
  ClockIcon,
  TruckFleetIcon,
  PriceIcon,
} from './Icons'
import styles from './WhyUs.module.css'

const REASONS = [
  {
    icon: <ShieldIcon />,
    title: 'Packing sesuai standar',
    desc: 'Kardus double, bubble wrap, atau peti kayu dipilih sesuai kerapuhan barang.',
  },
  {
    icon: <ClockIcon />,
    title: 'Respon cepat',
    desc: 'Pertanyaan dan pemesanan dibalas langsung lewat WhatsApp, tanpa lempar-lempar admin.',
  },
  {
    icon: <TruckFleetIcon />,
    title: 'Armada sesuai muatan',
    desc: 'Motor box untuk kiriman kecil, mobil pickup untuk barang besar atau banyak.',
  },
  {
    icon: <PriceIcon />,
    title: 'Harga jelas di awal',
    desc: 'Estimasi biaya disampaikan sebelum pekerjaan dimulai, tanpa tambahan mendadak.',
  },
]

const STATS = [
  { label: '2 layanan', desc: 'bisa dipesan terpisah — antar saja atau packing saja' },
  { label: '1 tim', desc: 'menangani packing dan pengantaran dalam kombo yang sama' },
  { label: 'Chat langsung', desc: 'ke tim, bukan ke sistem otomatis' },
]

export default function WhyUs() {
  return (
    <section className={styles.why} id="kenapa">
      <div className={`wrap ${styles.grid}`}>
        <div>
          <span className="eyebrow">Kenapa SIGAP Express</span>
          <h2 className={styles.heading}>Dikerjakan seperti barang itu milik kami sendiri.</h2>
          <div className={styles.list}>
            {REASONS.map((reason) => (
              <div className={styles.item} key={reason.title}>
                <div className={styles.icon}>{reason.icon}</div>
                <div>
                  <h3>{reason.title}</h3>
                  <p>{reason.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.visual}>
          {STATS.map((stat) => (
            <div className={styles.stat} key={stat.label}>
              <strong>{stat.label}</strong>
              <span>{stat.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}