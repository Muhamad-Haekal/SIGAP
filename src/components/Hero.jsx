import { WaIcon } from './Icons'
import { buildWaLink, DEFAULT_WA_MESSAGE } from '../utils/whatsapp'
import HeroScene from './HeroScene'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <span className="eyebrow">Layanan antar &amp; packing barang</span>
          <h1 className={styles.title}>
            Barang dijemput, dikemas rapi,<br />
            <span className={styles.accent}>sampai tanpa cemas.</span>
          </h1>
          <p className={styles.lead}>
            SIGAP Express mengantar dan mengemas barang Anda dengan standar kerja yang sama —
            teliti di setiap sudut kotak, aman di sepanjang jalan.
          </p>
          <div className={styles.cta}>
            <a
              className="btn btn-primary"
              href={buildWaLink(DEFAULT_WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WaIcon />
              Pesan sekarang
            </a>
            <a href="#layanan" className="btn btn-ghost">
              Lihat layanan
            </a>
          </div>
          <div className={styles.trust}>
            <div>
              <strong>3</strong>
              <span>pilihan layanan</span>
            </div>
            <div>
              <strong>Kardus &amp; kayu</strong>
              <span>packing sesuai jenis barang</span>
            </div>
            <div>
              <strong>Respon cepat</strong>
              <span>balasan chat dalam hitungan menit</span>
            </div>
          </div>
        </div>

        <div className={styles.sceneBox} aria-hidden="true">
          <HeroScene />
        </div>
      </div>
    </section>
  )
}