import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../lib/api'
import type { NegotiationSummary } from '../types'
import styles from './NegotiationsPage.module.css'

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function statusLabel(status: string) {
  switch (status) {
    case 'ACTIVE':    return 'Active'
    case 'SETTLED':   return 'Settled'
    case 'WITHDRAWN': return 'Withdrawn'
    case 'FAILED':    return 'No deal'
    default:          return status
  }
}

function offerStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':  return 'Offer pending'
    case 'DENIED':   return 'Offer denied'
    case 'ACCEPTED': return 'Offer accepted'
    default:         return status
  }
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <polyline points="6,3 11,8 6,13" />
    </svg>
  )
}

export default function NegotiationsPage() {
  const navigate = useNavigate()
  const api = useApi()
  const [negotiations, setNegotiations] = useState<NegotiationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<NegotiationSummary[]>('/api/v1/negotiations')
      .then(setNegotiations)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load negotiations'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <AppLoader />

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Negotiations</h1>
            <p className={styles.pageSubtitle}>
              Track and manage your medical bill negotiations.
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {negotiations.length === 0 && !error ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No negotiations yet</div>
            <p className={styles.emptyDesc}>
              Upload an EOB to automatically start a negotiation when you owe a balance.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {negotiations.map(n => {
              const hasOffer = !!n.latestOffer
              const settled = n.status === 'SETTLED'
              const savings = settled && n.latestOffer && n.originalAmount
                ? n.originalAmount - n.latestOffer.amount
                : null

              return (
                <div
                  key={n.id}
                  className={styles.card}
                  onClick={() => navigate(`/negotiations/${n.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/negotiations/${n.id}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardLeft}>
                      <div className={styles.providerName}>{n.providerName ?? 'Unknown Provider'}</div>
                      <div className={styles.cardMeta}>
                        {n.serviceDateStart
                          ? new Date(n.serviceDateStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                        {n.payerClaimNumber ? ` · #${n.payerClaimNumber}` : ''}
                        {' · '}
                        <Link
                          to={`/eobs/${n.eobId}`}
                          className={styles.eobLink}
                          onClick={e => e.stopPropagation()}
                        >
                          View EOB
                        </Link>
                      </div>
                    </div>
                    <div className={styles.cardRight}>
                      <span className={`${styles.statusBadge} ${styles[`status_${n.status.toLowerCase()}`]}`}>
                        {statusLabel(n.status)}
                      </span>
                      <ChevronRightIcon />
                    </div>
                  </div>

                  <div className={styles.amounts}>
                    <div className={styles.amountBlock}>
                      <span className={styles.amountLabel}>Original</span>
                      <span className={styles.amountValue}>{n.originalAmount != null ? fmt(n.originalAmount) : '—'}</span>
                    </div>
                    {n.minSuggested != null && n.maxSuggested != null && (
                      <div className={styles.amountBlock}>
                        <span className={styles.amountLabel}>AI Suggested Range</span>
                        <span className={styles.amountValue}>{fmt(n.minSuggested)} – {fmt(n.maxSuggested)}</span>
                      </div>
                    )}
                    {hasOffer && (
                      <div className={styles.amountBlock}>
                        <span className={styles.amountLabel}>{offerStatusLabel(n.latestOffer!.status)}</span>
                        <span className={`${styles.amountValue} ${styles.offerAmount}`}>{fmt(n.latestOffer!.amount)}</span>
                      </div>
                    )}
                    {savings != null && savings > 0 && (
                      <div className={styles.savingsRow}>
                        <span className={styles.savingsLabel}>You saved</span>
                        <span className={styles.savingsValue}>{fmt(savings)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
