import ServiceCard from './ServiceCard'
import { TruckIcon, ComboIcon, PackageIcon } from './Icons'
import styles from './Services.module.css'

const SERVICES = [
  {
    id: 'antar',
    icon: <TruckIcon />,
    title: 'Jasa Pengantaran',
    desc: 'Antar barang dari titik jemput ke tujuan menggunakan motor box atau mobil pickup, sesuai ukuran dan jumlah muatan.',
    points: [
      'Pantau estimasi waktu tiba lewat chat',
      'Armada motor & pickup untuk dalam kota',
      'Konfirmasi foto saat barang diterima',
    ],
    ctaMsg: 'Halo SIGAP Express, saya ingin tanya soal Jasa Pengantaran.',
  },
  {
    id: 'kombo',
    icon: <ComboIcon />,
    title: 'Antar + Packing (Kombo)',
    desc: 'Barang dikemas di lokasi Anda, lalu langsung diantar dalam satu kunjungan. Praktis untuk pindahan kecil atau kiriman rentan pecah.',
    points: [
      'Satu tim untuk kemas dan antar',
      'Lebih hemat dibanding pesan terpisah',
      'Cocok untuk elektronik & furnitur',
    ],
    ctaMsg: 'Halo SIGAP Express, saya ingin tanya soal paket Antar + Packing.',
    featured: true,
    tag: 'Paling diminati',
  },
  {
    id: 'packing',
    icon: <PackageIcon />,
    title: 'Packing & Wrapping',
    desc: 'Pengemasan barang pecah belah, elektronik, dan furnitur dengan kardus, bubble wrap, atau peti kayu — barang Anda tetap di tempat.',
    points: [
      'Bahan disesuaikan jenis barang',
      'Label penanganan (mudah pecah, atas-bawah)',
      'Bisa dipesan tanpa pengantaran',
    ],
    ctaMsg: 'Halo SIGAP Express, saya ingin tanya soal Jasa Packing & Wrapping.',
  },
]

export default function Services() {
  return (
    <section className={styles.services} id="layanan">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Layanan</span>
          <h2>Tiga cara mengirim barang, satu standar kerja.</h2>
          <p>Pilih sesuai kebutuhan — mengantar saja, mengemas saja, atau keduanya sekaligus dalam satu pesanan.</p>
        </div>
        <div className={styles.cards}>
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}