import { WaIcon } from './Icons'
import { buildWaLink, DEFAULT_WA_MESSAGE } from '../utils/whatsapp'
import styles from './WhatsAppFab.module.css'

export default function WhatsAppFab() {
  return (
    <a
      className={styles.fab}
      href={buildWaLink(DEFAULT_WA_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
    >
      <WaIcon />
    </a>
  )
}