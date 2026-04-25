import { useEffect, useState, useCallback } from 'react'
import { useApi } from './useApi'
import type { PayerConnectionStatus } from '../types'

type Status = 'loading' | 'connected' | 'disconnected' | 'error'

export function usePayerConnection() {
  const api = useApi()
  const [status, setStatus] = useState<Status>('loading')
  const [connection, setConnection] = useState<PayerConnectionStatus | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    api.get<PayerConnectionStatus>('/api/v1/auth/aetna/status')
      .then(res => {
        setConnection(res)
        setStatus(res.connected ? 'connected' : 'disconnected')
      })
      .catch(() => setStatus('error'))
  }, [api])

  useEffect(() => { load() }, [load])

  const startConnect = useCallback(async () => {
    const res = await api.post<{ authUrl: string }>('/api/v1/auth/aetna/start', {})
    window.location.href = res.authUrl
  }, [api])

  const triggerSync = useCallback(async () => {
    await api.post<{ fetched: number }>('/api/v1/auth/aetna/sync', {})
    load()
  }, [api, load])

  return { status, connection, startConnect, triggerSync, reload: load }
}
