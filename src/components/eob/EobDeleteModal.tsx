import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { ApiError } from '../../lib/api'
import styles from './EobDeleteModal.module.css'

interface Props {
  eobId: string
  onClose: () => void
  onDeleted: () => void
}

export default function EobDeleteModal({ eobId, onClose, onDeleted }: Props) {
  const api = useApi()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, deleting])

  async function handleDelete() {
    setError(null)
    setDeleting(true)
    try {
      await api.delete(`/api/v1/eobs/${eobId}`)
      onDeleted()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete. Please try again.'
      setError(message)
      setDeleting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={!deleting ? onClose : undefined}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Delete EOB</span>
          <button className={styles.closeBtn} onClick={onClose} disabled={deleting} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDesc}>
            This will permanently remove the claim from your account. This action cannot be undone.
          </p>
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertIcon />
              {error}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
            {deleting ? <span className={styles.spinner} /> : <TrashIcon />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
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

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="5" x2="8" y2="8.5" />
      <circle cx="8" cy="11" r="0.5" fill="currentColor" />
    </svg>
  )
}
