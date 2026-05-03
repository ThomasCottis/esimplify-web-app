import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import EobCard from '../components/eob/EobCard'
import { useApi } from '../hooks/useApi'
import type { Eob } from '../types'
import styles from './EpisodeDetailPage.module.css'

interface EpisodeDetail {
  id: string
  patientId: string
  label?: string
  description?: string
  dateOfServiceStart?: string
  dateOfServiceEnd?: string
  primaryIcd10Code?: string
  primaryIcd10Desc?: string
  totalBilled?: number
  totalPayerPaid?: number
  totalPatientOwed?: number
  createdAt: string
  eobs: Eob[]
}

function fmt(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function dateRange(start?: string, end?: string): string {
  if (!start) return '—'
  const s = fmtDate(start)
  if (!end || end === start) return s
  return `${s} – ${fmtDate(end)}`
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <polyline points="10,3 5,8 10,13" />
    </svg>
  )
}

export default function EpisodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const api = useApi()
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get<EpisodeDetail>(`/api/v1/episodes/${id}`)
      .then(data => { setEpisode(data); setLoading(false) })
      .catch(() => { setError('Failed to load episode.'); setLoading(false) })
  }, [id])

  if (loading) return <AppLoader />

  if (error || !episode) {
    return (
      <DashboardLayout>
        <div className={styles.page}>
          <div className={styles.errorState}>{error ?? 'Episode not found.'}</div>
        </div>
      </DashboardLayout>
    )
  }

  const owedZero = (episode.totalPatientOwed ?? 0) === 0

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
          Back
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{episode.label ?? 'Episode of Care'}</h1>
          <div className={styles.dates}>{dateRange(episode.dateOfServiceStart, episode.dateOfServiceEnd)}</div>
          {episode.primaryIcd10Code && (
            <div className={styles.diagnosis}>
              <span className={styles.diagCode}>{episode.primaryIcd10Code}</span>
              {episode.primaryIcd10Desc && <span className={styles.diagDesc}>{episode.primaryIcd10Desc}</span>}
            </div>
          )}
          {episode.description && (
            <p className={styles.description}>{episode.description}</p>
          )}
        </div>

        {/* Financials */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Financial Summary</div>
          <div className={styles.financialsGrid}>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Total Billed</span>
              <span className={styles.financialValue}>{fmt(episode.totalBilled)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Insurance Paid</span>
              <span className={styles.financialValue}>{fmt(episode.totalPayerPaid)}</span>
            </div>
            <div className={`${styles.financialItem} ${styles.financialItemOwed}`}>
              <span className={styles.financialLabel}>Your Responsibility</span>
              <span className={`${styles.financialValue} ${owedZero ? styles.owedZero : styles.owedAmount}`}>
                {owedZero ? '$0 — Fully Covered' : fmt(episode.totalPatientOwed)}
              </span>
            </div>
          </div>
        </div>

        {/* Related EOBs */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Explanations of Benefits</div>
            <div className={styles.sectionCount}>{episode.eobs.length} claim{episode.eobs.length !== 1 ? 's' : ''}</div>
          </div>

          {episode.eobs.length === 0 ? (
            <div className={styles.empty}>No EOBs linked to this episode yet.</div>
          ) : (
            episode.eobs.map(eob => (
              <EobCard key={eob.id} eob={eob} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
