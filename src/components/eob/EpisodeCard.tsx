import type { EpisodeOfCare } from '../../types'
import EobCard from './EobCard'
import styles from './EpisodeCard.module.css'

interface Props {
  episode: EpisodeOfCare
}

function fmt(amount?: number): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function dateRange(start?: string, end?: string): string {
  if (!start) return '—'
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (!end || end === start) return s
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

export default function EpisodeCard({ episode }: Props) {
  const owedZero = (episode.totalPatientOwed ?? 0) === 0

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.label}>{episode.label ?? 'Episode of Care'}</div>
          <div className={styles.dates}>{dateRange(episode.dateOfServiceStart, episode.dateOfServiceEnd)}</div>
          {episode.primaryIcd10Code && (
            <div className={styles.diagnosis}>
              <span className={styles.diagCode}>{episode.primaryIcd10Code}</span>
              {episode.primaryIcd10Desc && <span className={styles.diagDesc}>{episode.primaryIcd10Desc}</span>}
            </div>
          )}
          <div className={styles.financials}>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Total Billed</span>
              <span className={styles.financialValue}>{fmt(episode.totalBilled)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Insurance Paid</span>
              <span className={styles.financialValue}>{fmt(episode.totalPayerPaid)}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.totalOwed} ${owedZero ? styles.totalOwedZero : ''}`}>
            {owedZero ? '$0' : fmt(episode.totalPatientOwed)}
          </div>
          <span className={styles.totalLabel}>your total responsibility</span>
        </div>
      </div>

      {(episode.eobs?.length ?? 0) > 0 && (
        <div className={styles.eobList}>
          <div className={styles.eobListLabel}>
            {episode.eobs!.length} explanation{episode.eobs!.length !== 1 ? 's' : ''} of benefits
          </div>
          {episode.eobs!.map(eob => (
            <EobCard key={eob.id} eob={eob} />
          ))}
        </div>
      )}
    </div>
  )
}
