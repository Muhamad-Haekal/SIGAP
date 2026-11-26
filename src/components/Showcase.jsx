import { LifterStage } from './figures/Lifter'
import { PackerStage } from './figures/Packer'
import styles from './Showcase.module.css'

export default function Showcase() {
  return (
    <section className={styles.section} id="standar">
      <div className="wrap">
        <div className={`section-head ${styles.head}`}>
          <span className="eyebrow">Standar kerja</span>
          <h2>Barang dijemput dan ditangani dengan cermat.</h2>
          <p>
            Dari cara mengangkat sampai perlindungan kemasan, setiap langkah dibuat agar barang
            siap menempuh perjalanan dengan aman.
          </p>
        </div>

        <div className={styles.scenes}>
          <article className={styles.scene}>
            <div className={styles.sceneLabel}>
              <span>01</span>
              <div>
                <h3>Angkat dengan aman</h3>
                <p>Barang dipindahkan dengan posisi yang lebih terjaga.</p>
              </div>
            </div>
            <LifterStage />
          </article>
          <article className={styles.scene}>
            <div className={styles.sceneLabel}>
              <span>02</span>
              <div>
                <h3>Kemas dengan rapi</h3>
                <p>Perlindungan disesuaikan dengan jenis barang.</p>
              </div>
            </div>
            <PackerStage />
          </article>
        </div>
      </div>
    </section>
  )
}
