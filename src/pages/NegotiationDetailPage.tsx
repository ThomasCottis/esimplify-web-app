import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../lib/api'
import type { NegotiationDetail } from '../types'
import styles from './NegotiationDetailPage.module.css'

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <polyline points="10,3 5,8 10,13" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7" x2="8" y2="11" />
      <circle cx="8" cy="5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function sourceLabel(source: string) {
  switch (source) {
    case 'PATIENT':  return 'You'
    case 'PROVIDER': return 'Provider'
    case 'SYSTEM':   return 'eSimplify'
    default:         return source
  }
}

export default function NegotiationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const api = useApi()

  const [negotiation, setNegotiation] = useState<NegotiationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [offerAmount, setOfferAmount] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api.get<NegotiationDetail>(`/api/v1/negotiations/${id}`)
      .then(n => {
        setNegotiation(n)
        // Default slider to maxSuggested if available
        setOfferAmount(n.maxSuggested ?? 0)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load negotiation'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <AppLoader />
  if (error || !negotiation) {
    return (
      <DashboardLayout>
        <div className={styles.page}>
          <div className={styles.errorBanner}>{error ?? 'Negotiation not found'}</div>
        </div>
      </DashboardLayout>
    )
  }

  const isActive = negotiation.status === 'ACTIVE'

  // Don't show the offer form if the patient already has a pending offer awaiting response
  const latestOffer = negotiation.offers.length > 0
    ? negotiation.offers.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null
  const patientOfferPending = latestOffer?.source === 'PATIENT' && latestOffer?.status === 'PENDING'
  const canMakeOffer = isActive && !patientOfferPending

  const belowMin = negotiation.minSuggested != null && offerAmount < negotiation.minSuggested
  const sliderMax = negotiation.offers
    .filter(o => o.status !== 'ACCEPTED')
    .reduce<number>((max, o) => Math.max(max, o.amount), negotiation.maxSuggested ?? 0)

  async function handleSubmitOffer() {
    if (!id || offerAmount <= 0) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const updated = await api.post<NegotiationDetail>(`/api/v1/negotiations/${id}/offers`, { amount: offerAmount })
        .catch(async () => {
          // Offer was created; refetch the full detail
          return api.get<NegotiationDetail>(`/api/v1/negotiations/${id}`)
        })
      setNegotiation(updated)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit offer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/negotiations')}>
          <BackIcon />
          Negotiations
        </button>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Negotiation</h1>
            <p className={styles.subtitle}>
              Started {new Date(negotiation.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              <Link to={`/eobs/${negotiation.eobId}`} className={styles.eobLink}>View EOB</Link>
            </p>
          </div>
          <span className={`${styles.statusBadge} ${styles[`status_${negotiation.status.toLowerCase()}`]}`}>
            {negotiation.status.charAt(0) + negotiation.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* AI Suggested Range */}
        {(negotiation.minSuggested != null || negotiation.maxSuggested != null) && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>AI Suggested Range</div>
            <p className={styles.cardDesc}>
              Based on the services on this claim, eSimplify suggests offering between{' '}
              <strong>{fmt(negotiation.minSuggested ?? 0)}</strong> and{' '}
              <strong>{fmt(negotiation.maxSuggested ?? 0)}</strong>.
              Providers commonly accept offers in this range.
            </p>
          </div>
        )}

        {/* Pending offer notice */}
        {isActive && patientOfferPending && (
          <div className={styles.pendingNotice}>
            Your offer of <strong>{fmt(latestOffer!.amount)}</strong> is awaiting a response from the provider.
            You can make another offer once they reply.
          </div>
        )}

        {/* Offer slider */}
        {canMakeOffer && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Make an Offer</div>
            <p className={styles.cardDesc}>
              Slide to choose how much you want to offer the provider.
            </p>

            <div className={styles.sliderSection}>
              <div className={styles.sliderAmountDisplay}>{fmt(offerAmount)}</div>

              <div className={styles.sliderWrapper}>
                {/* AI range markers */}
                {negotiation.minSuggested != null && negotiation.maxSuggested != null && sliderMax > 0 && (
                  <div className={styles.rangeMarkers}>
                    <div
                      className={styles.rangeBar}
                      style={{
                        left: `${(negotiation.minSuggested / sliderMax) * 100}%`,
                        width: `${((negotiation.maxSuggested - negotiation.minSuggested) / sliderMax) * 100}%`,
                      }}
                    />
                  </div>
                )}
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={1}
                  value={offerAmount}
                  onChange={e => setOfferAmount(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Offer amount"
                />
                <div className={styles.sliderTicks}>
                  <span>{fmt(0)}</span>
                  {negotiation.minSuggested != null && (
                    <span className={styles.tickSuggested}>AI min {fmt(negotiation.minSuggested)}</span>
                  )}
                  <span>{fmt(sliderMax)}</span>
                </div>
              </div>

              {/* Tactic note when below min */}
              {belowMin && negotiation.tacticNote && (
                <div className={styles.tacticCallout}>
                  <InfoIcon />
                  <div>
                    <div className={styles.tacticTitle}>Negotiation Tactic</div>
                    <div className={styles.tacticBody}>{negotiation.tacticNote}</div>
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <div className={styles.errorBanner}>{submitError}</div>
            )}

            <div className={styles.offerFooter}>
              <button
                className={styles.startBtn}
                onClick={handleSubmitOffer}
                disabled={submitting || offerAmount <= 0}
              >
                {submitting ? <span className={styles.spinner} /> : null}
                Start Negotiation
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {negotiation.offers.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Negotiation Timeline</div>
            <div className={styles.timeline}>
              {negotiation.offers.map((offer, idx) => (
                <div key={offer.id} className={styles.timelineRow}>
                  <div className={styles.timelineDot} />
                  {idx < negotiation.offers.length - 1 && <div className={styles.timelineLine} />}
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineSource}>{sourceLabel(offer.source)}</span>
                      <span className={`${styles.timelineStatus} ${styles[`offerStatus_${offer.status.toLowerCase()}`]}`}>
                        {offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className={styles.timelineAmount}>{fmt(offer.amount)}</div>
                    <div className={styles.timelineDate}>
                      {new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
