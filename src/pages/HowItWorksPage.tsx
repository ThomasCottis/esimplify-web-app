import { useDashboardData } from '../hooks/useDashboardData'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import styles from './HowItWorksPage.module.css'

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '0%'
  return `${Math.round((num / denom) * 100)}%`
}

const JOURNEY_STEPS = [
  {
    label: 'You receive care',
    body: 'A doctor, hospital, or specialist provides a service. They document the procedures using standardized codes (CPT codes) and diagnoses (ICD-10 codes).',
  },
  {
    label: 'Provider submits a claim',
    body: 'The provider sends a claim to your insurance company listing the services performed and the billed amounts — often much higher than what anyone actually pays.',
  },
  {
    label: 'Insurer processes the claim',
    body: 'Your insurance applies your contracted rates. In-network providers have agreed to "allowed amounts" that are typically far below what was billed.',
  },
  {
    label: 'Insurance pays its share',
    body: "After the allowed amount is established, your insurer pays a portion depending on your plan — factoring in whether you've met your deductible, copay, and coinsurance.",
  },
  {
    label: 'You receive an EOB',
    body: 'An Explanation of Benefits (EOB) arrives from your insurer. It shows what was billed, what insurance paid, and what you owe. It is not a bill — it is a summary.',
  },
  {
    label: 'You may be able to negotiate',
    body: 'Providers commonly accept lower payments from patients who ask, especially with lump-sum offers. Non-profit hospitals are federally required to have financial assistance programs. eSimplify helps you make informed, data-backed offers.',
  },
]

const GLOSSARY = [
  {
    term: 'Patient',
    def: 'You — the person who received medical care and is ultimately responsible for unpaid balances after insurance.',
  },
  {
    term: 'Provider',
    def: 'Any doctor, hospital, clinic, or specialist that delivered care and submitted a claim.',
  },
  {
    term: 'Payer',
    def: 'Your insurance company — the entity that receives claims, applies benefit rules, and pays a portion of covered services.',
  },
  {
    term: 'Claim',
    def: 'A formal request a provider sends to your insurer asking to be paid for services rendered.',
  },
  {
    term: 'EOB',
    def: 'Explanation of Benefits — a document from your insurer showing what was billed, what they allowed, what they paid, and what you owe. Not a bill.',
  },
  {
    term: 'CPT Code',
    def: 'Current Procedural Terminology — a standardized numeric code that identifies the exact service or procedure performed (e.g., 99213 = office visit).',
  },
  {
    term: 'ICD-10 Code',
    def: 'International Classification of Diseases code — identifies your diagnosis or reason for the visit (e.g., M54.5 = low back pain).',
  },
  {
    term: 'Deductible',
    def: 'The amount you pay out-of-pocket each year before your insurance starts covering costs. Until you hit this threshold, most claims come straight to you.',
  },
  {
    term: 'Copay',
    def: 'A fixed dollar amount you pay per visit or prescription, regardless of the total cost (e.g., $25 per specialist visit).',
  },
  {
    term: 'Coinsurance',
    def: 'Your percentage share of the allowed amount after the deductible is met (e.g., you pay 20%, insurance pays 80%).',
  },
  {
    term: 'Allowed Amount',
    def: 'The contracted rate your insurer and an in-network provider agreed to — often much less than the billed charge.',
  },
  {
    term: 'Out-of-Pocket Maximum',
    def: 'The most you will pay in a plan year. Once reached, insurance covers 100% of covered services for the rest of the year.',
  },
]

export default function HowItWorksPage() {
  const dashboardState = useDashboardData()

  if (dashboardState.status === 'loading') return <AppLoader />

  const { summary, eobs } = dashboardState.status === 'ready'
    ? dashboardState.data
    : { summary: { totalOwed: 0, eobsWithBalance: 0, episodeCount: 0, deductibleMet: 0, deductibleLimit: 0 }, eobs: [] }

  const totalBilled = eobs.reduce((s, e) => s + (e.totalBilled ?? 0), 0)
  const totalInsurancePaid = eobs.reduce((s, e) => s + (e.totalPayerPaid ?? 0), 0)
  const totalOwed = summary.totalOwed
  const coverageRatio = totalBilled > 0 ? totalInsurancePaid / totalBilled : 0
  const hasData = eobs.length > 0

  function buildInsight(): string {
    if (!hasData) {
      return 'Upload an EOB to see a personalised summary of your billing activity and get AI-powered guidance on what you can negotiate.'
    }
    const covPct = Math.round(coverageRatio * 100)
    const owePct = totalBilled > 0 ? Math.round((totalOwed / totalBilled) * 100) : 0
    let insight = `Across your ${eobs.length} claim${eobs.length !== 1 ? 's' : ''}, providers billed ${fmt(totalBilled)} in total. `
    insight += `Your insurance covered ${covPct}% of that (${fmt(totalInsurancePaid)}), leaving you with ${fmt(totalOwed)} — `
    insight += `${owePct}% of the original charges. `

    if (totalOwed > 500) {
      insight += `Balances like yours are often negotiable: many providers will accept 60–80% of the patient responsibility in a single lump-sum payment. `
    } else if (totalOwed > 0) {
      insight += `Even smaller balances can be reduced — many providers offer prompt-pay discounts if you ask. `
    }

    if (covPct < 60 && totalBilled > 0) {
      insight += `Your coverage ratio is below average, which may indicate services processed out-of-network, a high-deductible plan, or claims worth reviewing for billing errors. `
    }

    insight += `Use the Negotiations tab to make a data-backed offer and track responses from your providers.`
    return insight
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>How It Works</h1>
          <p className={styles.subtitle}>
            Understand your medical bills, learn the language of healthcare billing, and see how eSimplify helps you pay less.
          </p>
        </div>

        {/* EOB Summary + AI Insight */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Your EOB Summary</div>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Billed</span>
              <span className={styles.summaryValue}>{hasData ? fmt(totalBilled) : '—'}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Insurance Paid</span>
              <span className={`${styles.summaryValue} ${styles.summaryPaid}`}>{hasData ? fmt(totalInsurancePaid) : '—'}</span>
            </div>
            {hasData && totalBilled > 0 && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Coverage Rate</span>
                <span className={styles.summaryValue}>{pct(totalInsurancePaid, totalBilled)}</span>
              </div>
            )}
            <div className={`${styles.summaryItem} ${styles.summaryItemOwed}`}>
              <span className={styles.summaryLabel}>Your Balance</span>
              <span className={`${styles.summaryValue} ${styles.summaryOwed}`}>{hasData ? fmt(totalOwed) : '—'}</span>
            </div>
          </div>
          <div className={styles.aiInsight}>
            <div className={styles.aiInsightLabel}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6.5" />
                <line x1="8" y1="7" x2="8" y2="11" />
                <circle cx="8" cy="5" r="0.5" fill="currentColor" />
              </svg>
              AI Overview
            </div>
            <p className={styles.aiInsightText}>{buildInsight()}</p>
          </div>
        </div>

        {/* Care Journey Timeline */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Your Care Journey</div>
          <p className={styles.cardDesc}>
            Here is what happens from the moment you walk into a provider's office to when you receive a bill.
          </p>
          <div className={styles.journey}>
            {JOURNEY_STEPS.map((step, idx) => (
              <div key={idx} className={styles.journeyStep}>
                <div className={styles.journeyLeft}>
                  <div className={styles.journeyDot}>{idx + 1}</div>
                  {idx < JOURNEY_STEPS.length - 1 && <div className={styles.journeyLine} />}
                </div>
                <div className={styles.journeyContent}>
                  <div className={styles.journeyLabel}>{step.label}</div>
                  <div className={styles.journeyBody}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Billing Glossary</div>
          <p className={styles.cardDesc}>Plain-English definitions of the terms that appear on your EOBs and bills.</p>
          <div className={styles.glossaryGrid}>
            {GLOSSARY.map(item => (
              <div key={item.term} className={styles.glossaryItem}>
                <div className={styles.termName}>{item.term}</div>
                <div className={styles.termDef}>{item.def}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
