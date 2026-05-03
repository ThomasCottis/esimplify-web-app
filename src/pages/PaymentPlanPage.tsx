import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import { useDashboardData } from '../hooks/useDashboardData'
import styles from './PaymentPlanPage.module.css'

function fmt(amount: number): string {
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7" x2="8" y2="11" />
      <circle cx="8" cy="5" r="0.5" fill="currentColor" />
    </svg>
  )
}

export default function PaymentPlanPage() {
  const navigate = useNavigate()
  const dashboardState = useDashboardData()
  const [discountPct, setDiscountPct] = useState(20)

  if (dashboardState.status === 'loading') return <AppLoader />

  const { summary, eobs } = dashboardState.status === 'ready'
    ? dashboardState.data
    : { summary: { totalOwed: 0, pendingBills: 0, episodeCount: 0, deductibleMet: 0, deductibleLimit: 0 }, eobs: [] }

  const totalBilled = eobs.reduce((sum, e) => sum + (e.totalBilled ?? 0), 0)
  const totalInsurancePaid = eobs.reduce((sum, e) => sum + (e.totalPayerPaid ?? 0), 0)
  const totalOwed = summary.totalOwed

  const discountAmount = totalOwed * (discountPct / 100)
  const afterDiscount = totalOwed - discountAmount

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
          Back
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Payment Plan</h1>
          <p className={styles.subtitle}>
            Understand your medical bills and explore options to reduce what you owe.
          </p>
        </div>

        {/* Your bill snapshot */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Your Bill Snapshot</div>
          <div className={styles.snapshotGrid}>
            <div className={styles.snapshotItem}>
              <span className={styles.snapshotLabel}>Total Billed by Providers</span>
              <span className={styles.snapshotValue}>{fmt(totalBilled)}</span>
            </div>
            <div className={styles.snapshotItem}>
              <span className={styles.snapshotLabel}>Insurance Paid</span>
              <span className={`${styles.snapshotValue} ${styles.snapshotPaid}`}>{fmt(totalInsurancePaid)}</span>
            </div>
            <div className={`${styles.snapshotItem} ${styles.snapshotItemOwed}`}>
              <span className={styles.snapshotLabel}>Your Current Balance</span>
              <span className={`${styles.snapshotValue} ${styles.snapshotOwed}`}>{fmt(totalOwed)}</span>
            </div>
          </div>
        </div>

        {/* How billing works */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>How Medical Billing Works</div>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.infoStep}>1</div>
              <div className={styles.infoContent}>
                <div className={styles.infoHeading}>Providers submit claims to your insurer</div>
                <div className={styles.infoBody}>
                  When you receive care, providers bill your insurance company for the full amount.
                  The billed amount is usually higher than what anyone actually pays.
                </div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoStep}>2</div>
              <div className={styles.infoContent}>
                <div className={styles.infoHeading}>Insurance applies contracted rates</div>
                <div className={styles.infoBody}>
                  Your insurer negotiates discounted rates with in-network providers.
                  The "allowed amount" is what they've agreed to pay — often much less than the billed amount.
                </div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoStep}>3</div>
              <div className={styles.infoContent}>
                <div className={styles.infoHeading}>You pay deductible, copay, and coinsurance</div>
                <div className={styles.infoBody}>
                  After insurance pays its share, your responsibility includes any deductible
                  balance, copays, and coinsurance (a percentage of the allowed amount).
                </div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoStep}>4</div>
              <div className={styles.infoContent}>
                <div className={styles.infoHeading}>You can often negotiate your balance</div>
                <div className={styles.infoBody}>
                  Many hospitals and providers will discount bills for patients who ask —
                  especially if you offer a lump-sum cash payment.
                  Nonprofit hospitals are federally required to have financial assistance programs.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discount calculator */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Negotiation Calculator</div>
          <p className={styles.calcDesc}>
            Providers often accept discounts ranging from 10–40% when patients ask, particularly for
            large balances or lump-sum payments. Use the slider to estimate your savings.
          </p>

          <div className={styles.calcBlock}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Discount: <strong>{discountPct}%</strong></span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={discountPct}
              onChange={e => setDiscountPct(Number(e.target.value))}
              className={styles.slider}
              aria-label="Discount percentage"
            />
            <div className={styles.sliderTicks}>
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          <div className={styles.calcResults}>
            <div className={styles.calcRow}>
              <span className={styles.calcRowLabel}>Original balance</span>
              <span className={styles.calcRowValue}>{fmt(totalOwed)}</span>
            </div>
            <div className={styles.calcRow}>
              <span className={styles.calcRowLabel}>Discount ({discountPct}%)</span>
              <span className={`${styles.calcRowValue} ${styles.calcRowSavings}`}>−{fmt(discountAmount)}</span>
            </div>
            <div className={`${styles.calcRow} ${styles.calcRowTotal}`}>
              <span className={styles.calcRowLabel}>After negotiation</span>
              <span className={`${styles.calcRowValue} ${styles.calcRowFinal}`}>{fmt(afterDiscount)}</span>
            </div>
          </div>

          <div className={styles.tip}>
            <InfoIcon />
            <span>
              Always request an itemized bill first. Billing errors are common —
              identifying incorrect charges before negotiating can reduce your balance further.
            </span>
          </div>
        </div>

        {/* What to do */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Next Steps</div>
          <ol className={styles.stepsList}>
            <li>Request an itemized bill from each provider and review every line item.</li>
            <li>Compare charges against your EOB — providers can only bill for what insurance approved.</li>
            <li>Call the provider's billing department and ask for a prompt-pay discount or financial assistance.</li>
            <li>Ask about interest-free payment plans — most providers offer them without requiring approval.</li>
            <li>If a bill was denied, check your EOB for the denial reason and consider filing an appeal.</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}
