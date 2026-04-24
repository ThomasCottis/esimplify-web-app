import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import styles from './DashboardLayout.module.css'

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}
