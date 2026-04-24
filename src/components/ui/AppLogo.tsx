import viteLogo from '../../assets/vite.svg'
import styles from './AppLogo.module.css'

export default function AppLogo() {
  return (
    <div className={styles.brand}>
      <img src={viteLogo} alt="" className={styles.mark} />
      <div className={styles.nameStack}>
        <span className={styles.name}>
          <span className={styles.accent}>e</span>Simplify
        </span>
        <span className={styles.sub}>health</span>
      </div>
    </div>
  )
}
