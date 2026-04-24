import styles from './AppLoader.module.css'

export default function AppLoader() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
    </div>
  )
}
