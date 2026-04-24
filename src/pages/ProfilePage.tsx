import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppLoader from '../components/ui/AppLoader'
import { usePatientProfile } from '../hooks/usePatientProfile'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../lib/api'
import type { Patient } from '../types'
import styles from './ProfilePage.module.css'

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

function toFormState(p: Patient): FormState {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    dateOfBirth: p.dateOfBirth,
    phone: p.phone ?? '',
    addressLine1: p.addressLine1 ?? '',
    addressLine2: p.addressLine2 ?? '',
    city: p.city ?? '',
    state: p.state ?? '',
    zip: p.zip ?? '',
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const api = useApi()
  const { user } = useUser()
  const { profile, isLoading, needsOnboarding } = usePatientProfile()

  const firstName = user?.firstName ?? ''
  const lastName = user?.lastName ?? ''
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const fullName = ([firstName, lastName].filter(Boolean).join(' ')) || email || 'User'
  const initials = ([firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase()) || (email[0]?.toUpperCase() ?? 'U')
  const imageUrl = user?.imageUrl

  const [form, setForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (needsOnboarding) navigate('/onboarding', { replace: true })
  }, [needsOnboarding, navigate])

  useEffect(() => {
    if (profile && !form) setForm(toFormState(profile))
  }, [profile, form])

  if (isLoading || !form) return <AppLoader />

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => prev ? { ...prev, [field]: e.target.value } : prev)
      setSaved(false)
      if (fieldErrors[field as keyof FieldErrors]) {
        setFieldErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    setSubmitError(null)
    setSaved(false)

    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      await api.put<Patient>('/api/v1/me', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        phone: form.phone.trim() || null,
        addressLine1: form.addressLine1.trim() || null,
        addressLine2: form.addressLine2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() ? form.state.trim().toUpperCase().slice(0, 2) : null,
        zip: form.zip.trim() || null,
      })
      setSaved(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSubtitle}>Update your personal information.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.identity}>
            <div className={styles.avatar}>
              {imageUrl ? (
                <img src={imageUrl} alt={fullName} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </div>
            <div className={styles.identityInfo}>
              <div className={styles.identityName}>{fullName}</div>
              {email && <div className={styles.identityEmail}>{email}</div>}
            </div>
          </div>

          <div className={styles.divider} />

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                />
                {fieldErrors.lastName && (
                  <span className={styles.fieldError}>{fieldErrors.lastName}</span>
                )}
              </div>
            </div>

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
              />
            </div>

            <div className={styles.divider} />

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
                maxLength={10}
              />
            </div>

            {submitError && (
              <div className={styles.errorBanner}>{submitError}</div>
            )}

            <div className={styles.actions}>
              {saved && <span className={styles.savedMsg}>Changes saved</span>}
              <button type="submit" className={styles.saveBtn} disabled={submitting}>
                {submitting ? (
                  <><span className={styles.spinner} />Saving…</>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
