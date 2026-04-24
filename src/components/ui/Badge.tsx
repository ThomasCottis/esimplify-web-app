import styles from './Badge.module.css'

type Variant = 'success' | 'warning' | 'error' | 'neutral' | 'accent'

interface Props {
  children: React.ReactNode
  variant?: Variant
}

export default function Badge({ children, variant = 'neutral' }: Props) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
}

export function claimStatusVariant(status: string): Variant {
  switch (status.toUpperCase()) {
    case 'PAID': return 'success'
    case 'DENIED': return 'error'
    case 'PARTIAL': return 'warning'
    case 'PENDING': return 'neutral'
    default: return 'neutral'
  }
}

export function billStatusVariant(status: string): Variant {
  switch (status.toUpperCase()) {
    case 'PAID': return 'success'
    case 'MATCHED': return 'accent'
    case 'DISPUTED': return 'error'
    case 'UNMATCHED': return 'warning'
    default: return 'neutral'
  }
}
