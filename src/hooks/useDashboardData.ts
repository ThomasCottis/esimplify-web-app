import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import type { EpisodeOfCare, Eob } from '../types'

interface ApiEpisode {
  id: string
  patientId: string
  label?: string
  description?: string
  dateOfServiceStart?: string
  dateOfServiceEnd?: string
  primaryIcd10Code?: string
  primaryIcd10Desc?: string
  totalBilled?: number
  totalPayerPaid?: number
  totalPatientOwed?: number
  createdAt: string
}

interface ApiEob {
  id: string
  patientId: string
  payerId: string
  providerId: string
  episodeId?: string
  payerClaimNumber?: string
  claimType: string
  serviceDateStart: string
  serviceDateEnd?: string
  totalBilled?: number
  totalAllowed?: number
  totalPayerPaid?: number
  totalDeductible?: number
  totalCopay?: number
  totalCoinsurance?: number
  totalNotCovered?: number
  totalPatientOwed?: number
  claimStatus: string
  denialReason?: string
  diagnoses: Eob['diagnoses']
  lineItems: Eob['lineItems']
  createdAt: string
}

interface ApiCoverage {
  id: string
  coverageOrder: number
  deductibleIndividual?: number
}

export interface DashboardSummary {
  totalOwed: number
  eobsWithBalance: number
  episodeCount: number
  deductibleMet: number
  deductibleLimit: number
}

export interface DashboardData {
  summary: DashboardSummary
  episodes: EpisodeOfCare[]
  eobs: Eob[]
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: DashboardData }
  | { status: 'error'; error: Error }

export function useDashboardData(refreshKey = 0) {
  const api = useApi()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    Promise.all([
      api.get<ApiEpisode[]>('/api/v1/episodes'),
      api.get<ApiEob[]>('/api/v1/eobs'),
      api.get<ApiCoverage[]>('/api/v1/coverages'),
    ])
      .then(([episodes, eobs, coverages]) => {
        if (cancelled) return

        const eobsByEpisode = new Map<string, ApiEob[]>()
        for (const eob of eobs) {
          if (eob.episodeId) {
            const list = eobsByEpisode.get(eob.episodeId) ?? []
            list.push(eob)
            eobsByEpisode.set(eob.episodeId, list)
          }
        }

        const mappedEpisodes: EpisodeOfCare[] = episodes.map(ep => ({
          id: ep.id,
          patientId: ep.patientId,
          label: ep.label,
          description: ep.description,
          dateOfServiceStart: ep.dateOfServiceStart,
          dateOfServiceEnd: ep.dateOfServiceEnd,
          primaryIcd10Code: ep.primaryIcd10Code,
          primaryIcd10Desc: ep.primaryIcd10Desc,
          totalBilled: ep.totalBilled,
          totalPayerPaid: ep.totalPayerPaid,
          totalPatientOwed: ep.totalPatientOwed,
          createdAt: ep.createdAt,
          eobs: (eobsByEpisode.get(ep.id) ?? []).map(eob => ({
            id: eob.id,
            patientId: eob.patientId,
            payerId: eob.payerId,
            providerId: eob.providerId,
            episodeId: eob.episodeId,
            payerClaimNumber: eob.payerClaimNumber,
            claimType: eob.claimType,
            serviceDateStart: eob.serviceDateStart,
            serviceDateEnd: eob.serviceDateEnd,
            totalBilled: eob.totalBilled,
            totalAllowed: eob.totalAllowed,
            totalPayerPaid: eob.totalPayerPaid,
            totalDeductible: eob.totalDeductible,
            totalCopay: eob.totalCopay,
            totalCoinsurance: eob.totalCoinsurance,
            totalNotCovered: eob.totalNotCovered,
            totalPatientOwed: eob.totalPatientOwed,
            claimStatus: eob.claimStatus,
            denialReason: eob.denialReason,
            diagnoses: eob.diagnoses,
            lineItems: eob.lineItems,
            createdAt: eob.createdAt,
          } satisfies Eob)),
        }))

        const eobsWithBalance = eobs.filter(e => (e.totalPatientOwed ?? 0) > 0)
        const totalOwed = eobsWithBalance.reduce((sum, e) => sum + (e.totalPatientOwed ?? 0), 0)

        const primaryCoverage = [...coverages].sort((a, b) => a.coverageOrder - b.coverageOrder)[0]
        const deductibleLimit = primaryCoverage?.deductibleIndividual ?? 0
        const deductibleMet = eobs.reduce((sum, e) => sum + (e.totalDeductible ?? 0), 0)

        const mappedEobs: Eob[] = eobs.map(eob => ({
          id: eob.id,
          patientId: eob.patientId,
          payerId: eob.payerId,
          providerId: eob.providerId,
          episodeId: eob.episodeId,
          payerClaimNumber: eob.payerClaimNumber,
          claimType: eob.claimType,
          serviceDateStart: eob.serviceDateStart,
          serviceDateEnd: eob.serviceDateEnd,
          totalBilled: eob.totalBilled,
          totalAllowed: eob.totalAllowed,
          totalPayerPaid: eob.totalPayerPaid,
          totalDeductible: eob.totalDeductible,
          totalCopay: eob.totalCopay,
          totalCoinsurance: eob.totalCoinsurance,
          totalNotCovered: eob.totalNotCovered,
          totalPatientOwed: eob.totalPatientOwed,
          claimStatus: eob.claimStatus,
          denialReason: eob.denialReason,
          diagnoses: eob.diagnoses,
          lineItems: eob.lineItems,
          createdAt: eob.createdAt,
        } satisfies Eob))

        setState({
          status: 'ready',
          data: {
            summary: {
              totalOwed,
              eobsWithBalance: eobsWithBalance.length,
              episodeCount: episodes.length,
              deductibleMet,
              deductibleLimit,
            },
            episodes: mappedEpisodes,
            eobs: mappedEobs,
          },
        })
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', error: err as Error })
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  return state
}
