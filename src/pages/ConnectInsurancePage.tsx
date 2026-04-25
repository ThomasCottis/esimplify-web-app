import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { usePayerConnection } from '../hooks/usePayerConnection'
import styles from './ConnectInsurancePage.module.css'

type Step = 'select' | 'review' | 'connecting' | 'success' | 'error'

const AETNA_SCOPES = [
  'Your medical claims and EOBs',
  'Coverage and plan details',
  'Deductible and out-of-pocket spending',
  'Provider information',
]

function AetnaLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#7D1935" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">A</text>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10l5 5 7-8" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5L2 4v4c0 3.3 2.5 5.8 6 6.5 3.5-.7 6-3.2 6-6.5V4L8 1.5z" />
      <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ConnectInsurancePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { status: connectionStatus, connection, startConnect } = usePayerConnection()

  const [step, setStep] = useState<Step>('select')
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Handle redirect from backend callback
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'true') setStep('success')
    else if (error) setStep('error')
  }, [searchParams])

  // If already connected and landing fresh, show success
  useEffect(() => {
    if (connectionStatus === 'connected' && !searchParams.get('success') && !searchParams.get('error')) {
      setStep('success')
    }
  }, [connectionStatus, searchParams])

  async function handleConnect() {
    try {
      setIsRedirecting(true)
      setStep('connecting')
      await startConnect()
    } catch {
      setStep('error')
      setIsRedirecting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Progress breadcrumb */}
          {(step === 'select' || step === 'review') && (
            <div className={styles.breadcrumb}>
              <span className={step === 'select' ? styles.breadcrumbActive : styles.breadcrumbDone}>
                1. Select insurer
              </span>
              <span className={styles.breadcrumbSep}>›</span>
              <span className={step === 'review' ? styles.breadcrumbActive : styles.breadcrumbPending}>
                2. Review &amp; connect
              </span>
            </div>
          )}

          {/* STEP 1: Select payer */}
          {step === 'select' && (
            <>
              <div className={styles.header}>
                <h1 className={styles.title}>Connect your insurance</h1>
                <p className={styles.subtitle}>
                  Link your insurance to automatically import your claims and EOBs.
                </p>
              </div>

              <div className={styles.payerGrid}>
                {/* Aetna — available */}
                <button
                  className={styles.payerCard}
                  onClick={() => setStep('review')}
                >
                  <div className={styles.payerLogo}>
                    <AetnaLogo />
                  </div>
                  <div className={styles.payerName}>Aetna</div>
                  <div className={styles.payerBadge}>Available</div>
                </button>

                {/* Coming soon payers */}
                {['UnitedHealthcare', 'Cigna', 'Blue Cross', 'Humana'].map(name => (
                  <div key={name} className={`${styles.payerCard} ${styles.payerCardDisabled}`}>
                    <div className={styles.payerLogoPlaceholder} />
                    <div className={styles.payerName}>{name}</div>
                    <div className={styles.payerBadgeSoon}>Coming soon</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: Review & consent */}
          {step === 'review' && (
            <>
              <button className={styles.backBtn} onClick={() => setStep('select')}>
                <ArrowLeftIcon />
                Back
              </button>

              <div className={styles.header}>
                <div className={styles.payerHeaderLogo}>
                  <AetnaLogo />
                </div>
                <h1 className={styles.title}>Connect with Aetna</h1>
                <p className={styles.subtitle}>
                  You'll be redirected to Aetna to sign in and grant eSimplify read-only access
                  to your claims data.
                </p>
              </div>

              <div className={styles.scopeCard}>
                <div className={styles.scopeTitle}>eSimplify will be able to see:</div>
                <ul className={styles.scopeList}>
                  {AETNA_SCOPES.map(scope => (
                    <li key={scope} className={styles.scopeItem}>
                      <CheckIcon />
                      <span>{scope}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.securityNote}>
                <ShieldIcon />
                <span>
                  eSimplify never stores your Aetna password. Tokens are encrypted at rest
                  and you can disconnect at any time.
                </span>
              </div>

              <button
                className={styles.connectBtn}
                onClick={handleConnect}
                disabled={isRedirecting}
              >
                {isRedirecting ? 'Redirecting to Aetna…' : 'Continue to Aetna'}
              </button>
            </>
          )}

          {/* STEP 3: Connecting / redirecting */}
          {step === 'connecting' && (
            <div className={styles.centerState}>
              <div className={styles.spinner} />
              <div className={styles.centerTitle}>Redirecting to Aetna…</div>
              <p className={styles.centerDesc}>
                You'll be returned here after signing in with Aetna.
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className={styles.centerState}>
              {connection?.tokenExpired ? (
                <>
                  <div className={styles.errorIcon}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="24" fill="var(--color-warning-subtle, #fffbeb)" />
                      <path d="M24 16v10M24 32v2" stroke="var(--color-warning, #d97706)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className={styles.centerTitle}>Re-authentication required</div>
                  <p className={styles.centerDesc}>
                    Your Aetna session has expired. Re-connect to continue syncing your claims.
                  </p>
                  <button className={styles.connectBtn} onClick={() => setStep('review')}>
                    Re-authenticate with Aetna
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.successIcon}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="24" fill="var(--color-success-subtle)" />
                      <path d="M14 24l8 8 12-14" stroke="var(--color-success)" strokeWidth="3"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.centerTitle}>Aetna connected!</div>
                  <p className={styles.centerDesc}>
                    We're importing your claims in the background. They'll appear in your
                    dashboard within a few minutes.
                  </p>
                  <button className={styles.connectBtn} onClick={() => navigate('/dashboard')}>
                    Go to dashboard
                  </button>
                </>
              )}
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div className={styles.centerState}>
              <div className={styles.errorIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="var(--color-error-subtle, #fef2f2)" />
                  <path d="M16 16l16 16M32 16L16 32" stroke="var(--color-error)" strokeWidth="3"
                    strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.centerTitle}>Connection failed</div>
              <p className={styles.centerDesc}>
                {searchParams.get('error') === 'aetna_denied'
                  ? 'You cancelled the Aetna authorization. You can try again at any time.'
                  : 'Something went wrong while connecting to Aetna. Please try again.'}
              </p>
              <button
                className={styles.connectBtn}
                onClick={() => setStep('select')}
              >
                Try again
              </button>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
