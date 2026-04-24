import { useState } from 'react'
import type { Eob } from '../../types'
import Badge, { claimStatusVariant } from '../ui/Badge'
import styles from './EobCard.module.css'

interface Props {
  eob: Eob
}

function fmt(amount?: number): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function providerName(eob: Eob): string {
  if (eob.provider?.organizationName) return eob.provider.organizationName
  if (eob.provider?.firstName || eob.provider?.lastName) {
    return [eob.provider.firstName, eob.provider.lastName].filter(Boolean).join(' ')
  }
  return 'Unknown Provider'
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function EobCard({ eob }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasLines = (eob.lineItems?.length ?? 0) > 0
  const owedZero = (eob.totalPatientOwed ?? 0) === 0

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => hasLines && setExpanded(v => !v)}>
        <div className={styles.headerLeft}>
          <div className={styles.providerName}>{providerName(eob)}</div>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              {eob.provider?.specialty ?? eob.provider?.providerType ?? eob.claimType}
            </span>
            <span className={styles.metaItem}>·</span>
            <span className={styles.metaItem}>{formatDate(eob.serviceDateStart)}</span>
            {eob.payerClaimNumber && (
              <>
                <span className={styles.metaItem}>·</span>
                <span className={styles.metaItem}>#{eob.payerClaimNumber}</span>
              </>
            )}
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Badge variant={claimStatusVariant(eob.claimStatus)}>
              {eob.claimStatus.charAt(0) + eob.claimStatus.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.patientOwed} ${owedZero ? styles.patientOwedZero : ''}`}>
            {owedZero ? 'Covered' : fmt(eob.totalPatientOwed)}
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)' }}>
            your responsibility
          </span>
        </div>
      </div>

      <div className={styles.financials}>
        <div className={styles.financialItem}>
          <span className={styles.financialLabel}>Billed</span>
          <span className={styles.financialValue}>{fmt(eob.totalBilled)}</span>
        </div>
        <div className={styles.financialItem}>
          <span className={styles.financialLabel}>Allowed</span>
          <span className={styles.financialValue}>{fmt(eob.totalAllowed)}</span>
        </div>
        <div className={styles.financialItem}>
          <span className={styles.financialLabel}>Payer Paid</span>
          <span className={styles.financialValue}>{fmt(eob.totalPayerPaid)}</span>
        </div>
        <div className={styles.financialItem}>
          <span className={styles.financialLabel}>Deductible</span>
          <span className={styles.financialValue}>{fmt(eob.totalDeductible)}</span>
        </div>
      </div>

      {hasLines && (
        <button className={styles.expandToggle} onClick={() => setExpanded(v => !v)}>
          <svg className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="2,5 7,9 12,5" />
          </svg>
          {expanded ? 'Hide' : 'Show'} line items ({eob.lineItems!.length})
        </button>
      )}

      {expanded && hasLines && (
        <div className={styles.lineItems}>
          <div className={styles.lineItemsHeader}>
            <div className={styles.lineItemsHeaderCell}>Service</div>
            <div className={styles.lineItemsHeaderCell}>Billed</div>
            <div className={styles.lineItemsHeaderCell}>Allowed</div>
            <div className={styles.lineItemsHeaderCell}>Paid</div>
            <div className={styles.lineItemsHeaderCell}>You Owe</div>
          </div>
          {eob.lineItems!.map(li => (
            <div key={li.id} className={styles.lineItemRow}>
              <div className={styles.lineDesc}>
                <span className={styles.lineCode}>{li.serviceCode}</span>
                <span className={styles.linePlain}>{li.plainDescription ?? li.description ?? '—'}</span>
              </div>
              <div className={styles.lineAmount}>{fmt(li.billedAmount)}</div>
              <div className={styles.lineAmount}>{fmt(li.allowedAmount)}</div>
              <div className={styles.lineAmount}>{fmt(li.payerPaidAmount)}</div>
              <div className={`${styles.lineAmount} ${styles.lineAmountOwed}`}>
                {fmt(li.patientResponsibility)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
