import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/ui/StatCard'
import EpisodeCard from '../components/eob/EpisodeCard'
import AppLoader from '../components/ui/AppLoader'
import { usePatientProfile } from '../hooks/usePatientProfile'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePayerConnection } from '../hooks/usePayerConnection'
import styles from './DashboardPage.module.css'

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 11V3M4 6l4-4 4 4" />
      <path d="M2 13h12" />
    </svg>
  )
}

function InsuranceShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75">
      <path d="M12 2L3 6.5v5c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10v-5L12 2z" />
      <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile, isLoading: profileLoading, needsOnboarding } = usePatientProfile()
  const dashboardState = useDashboardData()
  const { status: connectionStatus, connection } = usePayerConnection()

  useEffect(() => {
    if (needsOnboarding) navigate('/onboarding', { replace: true })
  }, [needsOnboarding, navigate])

  if (profileLoading || needsOnboarding || dashboardState.status === 'loading') return <AppLoader />

  const firstName = profile?.firstName ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const { summary, episodes } = dashboardState.status === 'ready'
    ? dashboardState.data
    : { summary: { totalOwed: 0, pendingBills: 0, episodeCount: 0, deductibleMet: 0, deductibleLimit: 0 }, episodes: [] }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>{greeting}, {firstName}</h1>
            <p className={styles.pageSubtitle}>
              Here's a summary of your healthcare billing activity.
            </p>
          </div>
          <button className={styles.uploadBtn}>
            <UploadIcon />
            Upload EOB
          </button>
        </div>

        {/* Insurance connect CTA */}
        {connectionStatus === 'disconnected' && (
          <div className={styles.connectBanner}>
            <div className={styles.connectBannerIcon}>
              <InsuranceShieldIcon />
            </div>
            <div className={styles.connectBannerText}>
              <div className={styles.connectBannerTitle}>Connect your insurance</div>
              <div className={styles.connectBannerDesc}>
                Link your Aetna account to automatically import your claims and EOBs.
              </div>
            </div>
            <button
              className={styles.connectBannerBtn}
              onClick={() => navigate('/connect-insurance')}
            >
              Connect now
            </button>
          </div>
        )}

        {connectionStatus === 'connected' && connection?.lastSyncedAt && (
          <div className={styles.syncedBadge}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--color-success)" strokeWidth="1.5">
              <path d="M4 7l2.5 2.5 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="7" r="6" />
            </svg>
            Aetna synced {new Date(connection.lastSyncedAt).toLocaleDateString()}
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            label="You Owe"
            value={fmt(summary.totalOwed)}
            sub={`Across ${summary.pendingBills} pending bill${summary.pendingBills !== 1 ? 's' : ''}`}
            variant="accent"
          />
          <StatCard
            label="Episodes of Care"
            value={String(summary.episodeCount)}
            sub="All time"
          />
          <StatCard
            label="Deductible Progress"
            value={fmt(summary.deductibleMet)}
            sub={summary.deductibleLimit > 0 ? `of ${fmt(summary.deductibleLimit)} individual` : 'No coverage on file'}
            progress={summary.deductibleLimit > 0 ? { value: summary.deductibleMet, max: summary.deductibleLimit } : undefined}
          />
        </div>

        {/* Episodes */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Episodes of Care</div>
            <div className={styles.sectionCount}>{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</div>
          </div>

          {episodes.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className={styles.emptyTitle}>No episodes yet</div>
              <p className={styles.emptyDesc}>
                Upload your first EOB or connect your insurance portal to get started.
              </p>
            </div>
          ) : (
            episodes.map(ep => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
