import { useState, useEffect, useRef } from 'react'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../lib/api'
import type { Eob, EobDraft, NpiProviderCandidate } from '../../types'
import styles from './EobUploadModal.module.css'

interface Props {
  onClose: () => void
  onUploaded: (eob: Eob) => void
}

type Phase = 'form' | 'uploading' | 'provider-selection' | 'confirming' | 'success'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function providerDisplayName(c: NpiProviderCandidate): string {
  if (c.organizationName) return c.organizationName
  return [c.firstName, c.lastName].filter(Boolean).join(' ')
}

export default function EobUploadModal({ onClose, onUploaded }: Props) {
  const api = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('form')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<EobDraft | null>(null)
  const [selectedNpi, setSelectedNpi] = useState<string | null>(null)

  // Close on Escape (only when not in-flight)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && phase !== 'uploading' && phase !== 'confirming') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, phase])

  function acceptFile(f: File) {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('PDF must be 20 MB or smaller.')
      return
    }
    setError(null)
    setFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) acceptFile(f)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) acceptFile(f)
    e.target.value = ''
  }

  // Stage 1: upload PDF → get parsed data + NPI candidates
  async function handleUpload() {
    if (!file) return
    setError(null)
    setPhase('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await api.upload<EobDraft>('/api/v1/eobs/upload', formData)
      setDraft(result)
      setSelectedNpi(result.providerCandidates[0]?.npi ?? null)
      setPhase('provider-selection')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Upload failed. Please try again.'
      setError(message)
      setPhase('form')
    }
  }

  // Stage 2: confirm selected provider → persist EOB
  async function handleConfirm() {
    if (!draft || !selectedNpi) return
    setError(null)
    setPhase('confirming')

    try {
      const eob = await api.post<Eob>('/api/v1/eobs', {
        parsedData: draft.parsedData,
        selectedNpi,
      })
      setPhase('success')
      onUploaded(eob)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save EOB. Please try again.'
      setError(message)
      setPhase('provider-selection')
    }
  }

  // ── Uploading state ──────────────────────────────
  if (phase === 'uploading') {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>Upload EOB</span>
          </div>
          <div className={styles.uploadingState}>
            <div className={styles.spinnerRing} />
            <div>
              <div className={styles.uploadingTitle}>Processing your document…</div>
              <div className={styles.uploadingSub}>
                Claude is reading your PDF and extracting the claim data. This usually takes 10–20 seconds.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Provider selection + confirming ─────────────
  if (phase === 'provider-selection' || phase === 'confirming') {
    const extractedName = draft
      ? (draft.parsedData.provider.organizationName ||
        [draft.parsedData.provider.firstName, draft.parsedData.provider.lastName].filter(Boolean).join(' '))
      : ''
    const isConfirming = phase === 'confirming'

    return (
      <div className={styles.overlay}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>Select Provider</span>
            <button className={styles.closeBtn} onClick={onClose} disabled={isConfirming} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          <div className={styles.modalBody}>
            <p className={styles.modalDesc}>
              The claim shows <strong>{extractedName || 'an unknown provider'}</strong>. Select the correct match from the NPI Registry below.
            </p>

            {draft && draft.providerCandidates.length === 0 ? (
              <div className={styles.noCandidates}>
                <AlertIcon />
                <span>No providers found in the NPI Registry. Go back and try re-uploading, or contact support.</span>
              </div>
            ) : (
              <div className={styles.candidateList}>
                {draft?.providerCandidates.map(c => {
                  const name = providerDisplayName(c)
                  const location = [c.city, c.state].filter(Boolean).join(', ')
                  const isSelected = selectedNpi === c.npi
                  return (
                    <button
                      key={c.npi}
                      className={`${styles.candidateItem} ${isSelected ? styles.candidateItemSelected : ''}`}
                      onClick={() => setSelectedNpi(c.npi)}
                      disabled={isConfirming}
                    >
                      <div className={styles.candidateName}>{name}</div>
                      {c.specialty && <div className={styles.candidateMeta}>{c.specialty}</div>}
                      <div className={styles.candidateMeta}>
                        NPI {c.npi}{location ? ` · ${location}` : ''}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {error && (
              <div className={styles.errorBanner} role="alert">
                <AlertIcon />
                {error}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.cancelBtn}
              onClick={() => { setPhase('form'); setDraft(null); setSelectedNpi(null); setError(null) }}
              disabled={isConfirming}
            >
              Back
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleConfirm}
              disabled={!selectedNpi || isConfirming}
            >
              {isConfirming ? <span className={styles.submitSpinner} /> : <SaveIcon />}
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Success state ────────────────────────────────
  if (phase === 'success') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>Upload EOB</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <CheckIcon />
            </div>
            <div>
              <div className={styles.successTitle}>EOB uploaded successfully</div>
              <div className={styles.successSub}>
                Your document has been processed and added to your account.
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.submitBtn} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form state ───────────────────────────────────
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Upload EOB</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <p className={styles.modalDesc}>
            Drop your PDF below. The payer and provider will be extracted automatically.
          </p>

          {/* Drop zone / file preview */}
          {!file ? (
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label="Upload PDF"
            >
              <span className={styles.dropZoneIcon}>
                <UploadCloudIcon />
              </span>
              <div className={styles.dropZoneTitle}>
                Drop your PDF here or click to browse
              </div>
              <div className={styles.dropZoneSub}>PDF only · max 20 MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={onInputChange}
              />
            </div>
          ) : (
            <div className={`${styles.dropZone} ${styles.dropZoneHasFile}`}>
              <div className={styles.filePill}>
                <span className={styles.fileIcon}><FileCheckIcon /></span>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileSize}>{formatBytes(file.size)}</div>
                </div>
                <button
                  className={styles.removeFile}
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertIcon />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleUpload}
            disabled={!file}
          >
            <UploadIcon />
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inline SVG icons ─────────────────────────────────

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  )
}

function UploadCloudIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M8 11V3M4 6l4-4 4 4" />
      <path d="M2 13h12" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 13H3a1 1 0 0 1-1-1V3l3-1h7l2 2v8a1 1 0 0 1-1 1z" />
      <rect x="5" y="8" width="6" height="5" rx="0.5" />
      <rect x="5" y="2" width="5" height="3" rx="0.5" />
    </svg>
  )
}

function FileCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="5" x2="8" y2="8.5" />
      <circle cx="8" cy="11" r="0.5" fill="currentColor" />
    </svg>
  )
}
