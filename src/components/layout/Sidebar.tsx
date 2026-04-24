import { NavLink } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'
import viteLogo from '../../assets/vite.svg'
import styles from './Sidebar.module.css'

function IconDashboard() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function IconLogOut() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9h8M11.5 6l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 3.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H11" strokeLinecap="round" />
    </svg>
  )
}

export default function Sidebar() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const firstName = user?.firstName ?? ''
  const lastName = user?.lastName ?? ''
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const fullName = ([firstName, lastName].filter(Boolean).join(' ')) || email || 'User'
  const initials = ([firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase()) || (email[0]?.toUpperCase() ?? 'U')
  const imageUrl = user?.imageUrl

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src={viteLogo} alt="" className={styles.brandMark} />
        <span className={styles.brandName}>eSimplify</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <div className={styles.navSectionLabel}>Main</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <IconDashboard />
            Dashboard
          </NavLink>
        </div>
      </nav>

      <div className={styles.footer}>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${styles.userRow} ${isActive ? styles.active : ''}`
          }
        >
          <div className={styles.avatar}>
            {imageUrl ? (
              <img src={imageUrl} alt={fullName} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>
          <span className={styles.footerLabel}>Profile</span>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{fullName}</div>
            {email && <div className={styles.userEmail}>{email}</div>}
          </div>
        </NavLink>

        <button
          className={styles.signOutBtn}
          onClick={() => signOut({ redirectUrl: '/' })}
        >
          <IconLogOut />
          <span className={styles.footerLabel}>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
