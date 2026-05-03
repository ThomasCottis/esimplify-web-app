import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import EobDeleteModal from '../components/eob/EobDeleteModal'
import { useApi } from '../hooks/useApi'
import type { Eob } from '../types'
import styles from './EobDetailPage.module.css'

function fmt(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <polyline points="10,3 5,8 10,13" />
    </svg>
  )
}

export default function EobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const api = useApi()
  const [eob, setEob] = useState<Eob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get<Eob>(`/api/v1/eobs/${id}`)
      .then(data => { setEob(data); setLoading(false) })
      .catch(() => { setError('Failed to load claim.'); setLoading(false) })
  }, [id])

  if (loading) return <AppLoader />

  if (error || !eob) {
    return (
      <DashboardLayout>
        <div className={styles.page}>
          <div className={styles.errorState}>{error ?? 'Claim not found.'}</div>
        </div>
      </DashboardLayout>
    )
  }

  const owedZero = (eob.totalPatientOwed ?? 0) === 0
  const hasDiagnoses = (eob.diagnoses?.length ?? 0) > 0
  const hasLineItems = (eob.lineItems?.length ?? 0) > 0

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Back nav */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
          Back
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.claimType}>{eob.claimType} Claim</span>
            {(eob.totalPatientOwed ?? 0) > 0 && (
              <span className={styles.statusBalanceDue}>Balance Due</span>
            )}
            <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
              <TrashIcon />
              Delete
            </button>
          </div>
          <div className={styles.serviceDate}>
            {fmtDate(eob.serviceDateStart)}{eob.serviceDateEnd && eob.serviceDateEnd !== eob.serviceDateStart ? ` – ${fmtDate(eob.serviceDateEnd)}` : ''}
          </div>
          {eob.payerClaimNumber && (
            <div className={styles.claimNumber}>Claim #{eob.payerClaimNumber}</div>
          )}
        </div>

        {/* Financials */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Financial Summary</div>
          <div className={styles.financialsGrid}>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Total Billed</span>
              <span className={styles.financialValue}>{fmt(eob.totalBilled)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Allowed Amount</span>
              <span className={styles.financialValue}>{fmt(eob.totalAllowed)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Insurance Paid</span>
              <span className={styles.financialValue}>{fmt(eob.totalPayerPaid)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Deductible</span>
              <span className={styles.financialValue}>{fmt(eob.totalDeductible)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Copay</span>
              <span className={styles.financialValue}>{fmt(eob.totalCopay)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Coinsurance</span>
              <span className={styles.financialValue}>{fmt(eob.totalCoinsurance)}</span>
            </div>
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Not Covered</span>
              <span className={styles.financialValue}>{fmt(eob.totalNotCovered)}</span>
            </div>
            <div className={`${styles.financialItem} ${styles.financialItemOwed}`}>
              <span className={styles.financialLabel}>Your Responsibility</span>
              <span className={`${styles.financialValue} ${owedZero ? styles.owedZero : styles.owedAmount}`}>
                {owedZero ? '$0 — Fully Covered' : fmt(eob.totalPatientOwed)}
              </span>
            </div>
          </div>
          {eob.denialReason && (
            <div className={styles.denialBanner}>
              <strong>Denial reason:</strong> {eob.denialReason}
            </div>
          )}
        </div>

        {/* Diagnoses */}
        {hasDiagnoses && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Diagnoses</div>
            <div className={styles.diagnosesList}>
              {eob.diagnoses!.map(d => (
                <div key={d.id} className={styles.diagnosisRow}>
                  <span className={styles.diagCode}>{d.icd10Code}</span>
                  <span className={styles.diagDesc}>{d.plainEnglish ?? d.description ?? '—'}</span>
                  {d.isPrincipal && <span className={styles.diagPrincipal}>Principal</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Items */}
        {hasLineItems && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Line Items</div>
            <div className={styles.lineItemsTable}>
              <div className={styles.lineItemsHeader}>
                <div className={styles.lineCol}>Service</div>
                <div className={styles.lineColNum}>Billed</div>
                <div className={styles.lineColNum}>Allowed</div>
                <div className={styles.lineColNum}>Paid</div>
                <div className={styles.lineColNum}>You Owe</div>
              </div>
              {eob.lineItems!.map(li => (
                <div key={li.id} className={styles.lineItemRow}>
                  <div className={styles.lineServiceCell}>
                    <span className={styles.lineCode}>{li.serviceCode}</span>
                    {li.serviceDate && <span className={styles.lineDateBadge}>{fmtDate(li.serviceDate)}</span>}
                    <span className={styles.lineDesc}>{li.plainDescription ?? li.description ?? '—'}</span>
                  </div>
                  <div className={styles.lineAmountCell}>{fmt(li.billedAmount)}</div>
                  <div className={styles.lineAmountCell}>{fmt(li.allowedAmount)}</div>
                  <div className={styles.lineAmountCell}>{fmt(li.payerPaidAmount)}</div>
                  <div className={`${styles.lineAmountCell} ${styles.lineAmountOwed}`}>{fmt(li.patientResponsibility)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <EobDeleteModal
          eobId={eob.id}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => navigate('/', { replace: true })}
        />
      )}
    </DashboardLayout>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 4 14 4" />
      <path d="M5 4V2h6v2" />
      <path d="M13 4l-1 10H4L3 4" />
    </svg>
  )
}
