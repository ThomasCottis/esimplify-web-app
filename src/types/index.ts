export interface Patient {
  id: string
  externalAuthId: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zip?: string
}

export interface Payer {
  id: string
  name: string
  payerId: string
}

export interface Provider {
  id: string
  npi?: string
  organizationName?: string
  firstName?: string
  lastName?: string
  providerType?: string
  specialty?: string
}

export interface EobLineItem {
  id: string
  lineNumber: number
  serviceDate?: string
  serviceCode: string
  serviceCodeType: string
  description?: string
  plainDescription?: string
  quantity?: number
  billedAmount?: number
  allowedAmount?: number
  payerPaidAmount?: number
  deductibleAmount?: number
  copayAmount?: number
  coinsuranceAmount?: number
  notCoveredAmount?: number
  patientResponsibility?: number
  lineStatus?: string
  denialReasonCode?: string
  denialReasonDesc?: string
}

export interface EobDiagnosis {
  id: string
  sequence: number
  icd10Code: string
  description?: string
  plainEnglish?: string
  isPrincipal: boolean
}

export interface Eob {
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
  payer?: Payer
  provider?: Provider
  diagnoses?: EobDiagnosis[]
  lineItems?: EobLineItem[]
  createdAt: string
}

export interface EpisodeOfCare {
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
  eobs?: Eob[]
  createdAt: string
}

export interface Coverage {
  id: string
  patientId: string
  payerId: string
  planName?: string
  planType?: string
  memberId: string
  groupNumber?: string
  deductibleIndividual?: number
  oopMaxIndividual?: number
  effectiveDate?: string
  terminationDate?: string
  payer?: Payer
}

export interface ProviderBill {
  id: string
  patientId: string
  providerId: string
  eobId?: string
  episodeId?: string
  billDate?: string
  dueDate?: string
  accountNumber?: string
  totalCharges?: number
  insurancePaid?: number
  adjustments?: number
  amountDue?: number
  status: 'UNMATCHED' | 'MATCHED' | 'PAID' | 'DISPUTED'
  provider?: Provider
}

export type ClaimStatus = 'PAID' | 'DENIED' | 'PARTIAL' | 'PENDING' | 'ADJUSTED'
export type BillStatus = 'UNMATCHED' | 'MATCHED' | 'PAID' | 'DISPUTED'
