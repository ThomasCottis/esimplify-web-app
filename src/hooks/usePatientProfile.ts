import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { ApiError } from '../lib/api'
import type { Patient } from '../types'

type State =
  | { status: 'loading' }
  | { status: 'found'; profile: Patient }
  | { status: 'not_found' }
  | { status: 'error'; error: Error }

export function usePatientProfile() {
  const api = useApi()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    api.get<Patient>('/api/v1/me')
      .then(profile => {
        if (!cancelled) setState({ status: 'found', profile })
      })
      .catch(err => {
        if (cancelled) return
        if (err instanceof ApiError && err.isNotFound) {
          setState({ status: 'not_found' })
        } else {
          setState({ status: 'error', error: err as Error })
        }
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    profile:        state.status === 'found' ? state.profile : null,
    isLoading:      state.status === 'loading',
    needsOnboarding: state.status === 'not_found',
    error:          state.status === 'error' ? state.error : null,
  }
}
