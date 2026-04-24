import styles from './StatCard.module.css'

interface Props {
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'accent' | 'success'
  progress?: { value: number; max: number }
}

export default function StatCard({ label, value, sub, variant = 'default', progress }: Props) {
  const valueClass = variant === 'accent'
    ? styles.valueAccent
    : variant === 'success'
      ? styles.valueSuccess
      : ''

  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${valueClass}`}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
      {progress && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min((progress.value / progress.max) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
