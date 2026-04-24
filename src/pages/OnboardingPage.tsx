import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../lib/api'
import type { Patient } from '../types'
import AppLogo from '../components/ui/AppLogo'
import styles from './OnboardingPage.module.css'

interface FormState {
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
}

interface FieldErrors {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
}

const EMPTY: FormState = {
  firstName: '', lastName: '', dateOfBirth: '',
  phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', zip: '',
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'
  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required'
  } else {
    const dob = new Date(form.dateOfBirth)
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      errors.dateOfBirth = 'Enter a valid past date'
    }
  }
  return errors
}

export default function OnboardingPage() {
  const api = useApi()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAddress, setShowAddress] = useState(false)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field as keyof FieldErrors]) {
        setFieldErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      await api.post<Patient>('/api/v1/me/profile', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        ...(form.phone.trim()        && { phone: form.phone.trim() }),
        ...(form.addressLine1.trim() && { addressLine1: form.addressLine1.trim() }),
        ...(form.addressLine2.trim() && { addressLine2: form.addressLine2.trim() }),
        ...(form.city.trim()         && { city: form.city.trim() }),
        ...(form.state.trim()        && { state: form.state.trim().toUpperCase().slice(0, 2) }),
        ...(form.zip.trim()          && { zip: form.zip.trim() }),
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(
          err.isConflict
            ? 'A profile already exists for this account.'
            : err.message,
        )
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <AppLogo />
          <h1 className={styles.title}>Set up your profile</h1>
          <p className={styles.subtitle}>
            We need a few details so we can match your bills and
            represent you with providers.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">
                First name <span className={styles.required}>*</span>
              </label>
              <input
                id="firstName"
                className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ''}`}
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={set('firstName')}
                disabled={submitting}
                placeholder="Mary"
              />
              {fieldErrors.firstName && (
                <span className={styles.fieldError}>{fieldErrors.firstName}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">
                Last name <span className={styles.required}>*</span>
              </label>
              <input
                id="lastName"
                className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ''}`}
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={set('lastName')}
                disabled={submitting}
                placeholder="Johnson"
              />
              {fieldErrors.lastName && (
                <span className={styles.fieldError}>{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          {/* DOB */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dateOfBirth">
              Date of birth <span className={styles.required}>*</span>
            </label>
            <input
              id="dateOfBirth"
              className={`${styles.input} ${fieldErrors.dateOfBirth ? styles.inputError : ''}`}
              type="date"
              autoComplete="bday"
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              disabled={submitting}
              max={new Date().toISOString().split('T')[0]}
            />
            {fieldErrors.dateOfBirth && (
              <span className={styles.fieldError}>{fieldErrors.dateOfBirth}</span>
            )}
          </div>

          {/* Phone */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Phone</label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              disabled={submitting}
              placeholder="(555) 000-0000"
            />
          </div>

          <div className={styles.divider} />

          {/* Address toggle */}
          <button
            type="button"
            className={styles.optionalToggle}
            onClick={() => setShowAddress(v => !v)}
          >
            <svg className={`${styles.chevron} ${showAddress ? styles.chevronOpen : ''}`} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="2,5 7,9 12,5" />
            </svg>
            {showAddress ? 'Hide' : 'Add'} address (optional)
          </button>

          {showAddress && (
            <div className={styles.optionalFields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="addressLine1">Address line 1</label>
                <input
                  id="addressLine1"
                  className={styles.input}
                  type="text"
                  autoComplete="address-line1"
                  value={form.addressLine1}
                  onChange={set('addressLine1')}
                  disabled={submitting}
                  placeholder="123 Main St"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="addressLine2">Address line 2</label>
                <input
                  id="addressLine2"
                  className={styles.input}
                  type="text"
                  autoComplete="address-line2"
                  value={form.addressLine2}
                  onChange={set('addressLine2')}
                  disabled={submitting}
                  placeholder="Apt 4B"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city">City</label>
                  <input
                    id="city"
                    className={styles.input}
                    type="text"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={set('city')}
                    disabled={submitting}
                    placeholder="Denver"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="state">State</label>
                  <input
                    id="state"
                    className={styles.input}
                    type="text"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={set('state')}
                    disabled={submitting}
                    placeholder="CO"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="zip">ZIP code</label>
                <input
                  id="zip"
                  className={styles.input}
                  type="text"
                  autoComplete="postal-code"
                  value={form.zip}
                  onChange={set('zip')}
                  disabled={submitting}
                  placeholder="80202"
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className={styles.errorBanner}>{submitError}</div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner} />
                Creating profile…
              </>
            ) : (
              'Continue to dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
