import { useState } from 'react'
import { LogoMark, WaIcon, MenuIcon } from './Icons'
import { buildWaLink, DEFAULT_WA_MESSAGE } from '../utils/whatsapp'
import styles from './Header.module.css'

const NAV_LINKS = [
  { href: '#layanan', label: 'Layanan' },
  { href: '#standar', label: 'Standar' },
  { href: '#proses', label: 'Cara Kerja' },
  { href: '#kenapa', label: 'Kenapa Kami' },
  { href: '#kontak', label: 'Kontak' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className={styles.header} role="banner">
      <div className={`wrap ${styles.nav}`}>
        <a href="#awal" className={styles.logo}>
          <span className={styles.logoMark}>
            <LogoMark />
          </span>
          Lorong Hitam
        </a>

        <nav
          id="primary-navigation"
          aria-label="Navigasi utama"
          className={`${styles.navLinks} ${isOpen ? styles.navLinksOpen : ''}`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeMenu()
          }}
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          <a
            className={`btn btn-primary ${styles.mobileCta}`}
            href={buildWaLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            <WaIcon />
            Chat WhatsApp
          </a>
        </nav>

        <div className={styles.navCta}>
          <a href="#kontak" className={`btn btn-ghost ${styles.navCtaBtn}`}>
            Kontak
          </a>
          <a
            className={`btn btn-primary ${styles.navCtaBtn}`}
            href={buildWaLink(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon />
            Chat WhatsApp
          </a>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  )
}
