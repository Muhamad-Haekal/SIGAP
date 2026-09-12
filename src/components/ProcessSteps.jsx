import styles from './ProcessSteps.module.css'

const STEPS = [
  { num: 1, title: 'Chat kebutuhan', desc: 'Kirim detail barang dan tujuan lewat WhatsApp.' },
  { num: 2, title: 'Estimasi harga', desc: 'Kami hitung biaya sesuai jarak, ukuran, dan layanan.' },
  { num: 3, title: 'Packing barang', desc: 'Barang dikemas sesuai kerapuhan dan jenisnya.' },
  { num: 4, title: 'Pengantaran', desc: 'Tim mengantar langsung ke alamat tujuan.' },
  { num: 5, title: 'Konfirmasi diterima', desc: 'Foto bukti serah terima dikirim ke Anda.' },
]

export default function ProcessSteps() {
  return (
    <section className={styles.process} id="proses">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Cara kerja</span>
          <h2>Lima langkah dari chat pertama sampai barang diterima.</h2>
        </div>
        <div className={styles.steps}>
          <div className={styles.line} aria-hidden="true" />
          {STEPS.map((step) => (
            <div className={styles.step} key={step.num}>
              <div className={styles.num}>{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}