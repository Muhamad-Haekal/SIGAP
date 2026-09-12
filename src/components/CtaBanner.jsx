import { WaIcon } from './Icons'
import { buildWaLink, DEFAULT_WA_MESSAGE } from '../utils/whatsapp'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <div className="wrap">
      <div className={styles.banner}>
        <div>
          <h2>Barang mau dikemas, diantar, atau dua-duanya?</h2>
          <p>Kirim detail barang dan alamat lewat WhatsApp, kami bantu hitungkan dan siapkan tim yang sesuai.</p>
        </div>
        <a
          className="btn btn-light"
          href={buildWaLink(DEFAULT_WA_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WaIcon />
          Chat via WhatsApp
        </a>
      </div>
    </div>
  )
}