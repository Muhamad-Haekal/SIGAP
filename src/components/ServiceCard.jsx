import { CheckIcon, ArrowIcon } from './Icons'
import { buildWaLink } from '../utils/whatsapp'
import styles from './ServiceCard.module.css'

export default function ServiceCard({ icon, title, desc, points = [], ctaMsg, featured = false, tag }) {
  return (
    <article className={`${styles.card} ${featured ? styles.featured : ''}`}>
      {tag && <span className={styles.tag}>{tag}</span>}
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul>
        {points.map((point) => (
          <li key={point}>
            <CheckIcon />
            {point}
          </li>
        ))}
      </ul>
      <a
        className={styles.cta}
        href={buildWaLink(ctaMsg)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tanya layanan ini
        <ArrowIcon />
      </a>
    </article>
  )
}