import styles from './AppLogo.module.css'

export default function AppLogo() {
  return (
    <div className={styles.brand}>
      <img src="/logo/esimplify-logo.png" alt="eSimplify" className={styles.mark} />
      <div className={styles.nameStack}>
        <span className={styles.name}>
          <span className={styles.accent}>e</span><span className={styles.simplify}>Simplify</span>
        </span>
        <span className={styles.sub}>health</span>
      </div>
    </div>
  )
}
