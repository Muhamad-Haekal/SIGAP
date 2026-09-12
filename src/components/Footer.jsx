import { LogoMark } from './Icons'
import { buildWaLink, DEFAULT_WA_MESSAGE } from '../utils/whatsapp'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} id="kontak">
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <div className={styles.logo}>
              <span className={styles.logoMark}>
                <LogoMark />
              </span>
              SIGAP Express
            </div>
            <p>Jasa pengantaran dan packing barang untuk kebutuhan rumah, kantor, dan usaha kecil.</p>
          </div>

          <div className={styles.col}>
            <h4>Layanan</h4>
            <ul>
              <li>
                <a href="#layanan">Jasa Pengantaran</a>
              </li>
              <li>
                <a href="#layanan">Packing &amp; Wrapping</a>
              </li>
              <li>
                <a href="#layanan">Antar + Packing</a>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Halaman</h4>
            <ul>
              <li>
                <a href="#proses">Cara Kerja</a>
              </li>
              <li>
                <a href="#kenapa">Kenapa Kami</a>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Kontak</h4>
            <ul>
              <li>
                <a
                  href={buildWaLink(DEFAULT_WA_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp: +62 856-9407-9087
                </a>
              </li>
              <li>
                <span className={styles.muted}>Area layanan: dapat disesuaikan</span>
              </li>
              <li>
                <span className={styles.muted}>Jam operasional: 08.00–20.00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 SIGAP Express. Semua hak dilindungi.</span>
          <span>Dibuat sebagai portofolio situs jasa pengantaran &amp; packing.</span>
        </div>
      </div>
    </footer>
  )
}