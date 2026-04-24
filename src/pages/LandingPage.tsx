import { SignInButton, SignUpButton } from '@clerk/react'
import AppLogo from '../components/ui/AppLogo'
import styles from './LandingPage.module.css'

function IconConsolidate() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--color-accent)" strokeWidth="1.75">
      <rect x="1" y="1" width="8" height="6" rx="1.5" />
      <rect x="13" y="1" width="8" height="6" rx="1.5" />
      <rect x="1" y="10" width="8" height="6" rx="1.5" />
      <rect x="13" y="10" width="8" height="6" rx="1.5" />
      <path d="M5 17v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function IconNegotiate() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--color-accent)" strokeWidth="1.75">
      <circle cx="11" cy="11" r="9" />
      <path d="M7.5 11h7M11 7.5l3.5 3.5-3.5 3.5" />
    </svg>
  )
}

function IconPay() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--color-accent)" strokeWidth="1.75">
      <rect x="1" y="5" width="20" height="14" rx="2" />
      <path d="M1 10h20" />
      <circle cx="6" cy="15" r="1.5" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <AppLogo />
        </div>
        <div className={styles.navActions}>
          <div className={styles.navSignIn}>
            <SignInButton mode="modal">
              <button className={styles.btnGhost}>Sign in</button>
            </SignInButton>
          </div>
          <div className={styles.navGetStarted}>
            <SignUpButton mode="modal">
              <button className={styles.btnPrimary}>Get started</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroEyebrow}>
          Healthcare billing, made simple
        </div>
        <h1 className={styles.heroHeadline}>
          Confusing bills, simplified{' '}
          <span className={styles.heroAccent}>into one lower payment.</span>
        </h1>
        <p className={styles.heroSub}>
          Stop juggling EOBs and bills from multiple providers. We consolidate
          everything into one negotiated payment — so you can focus on getting better.
        </p>
        <div className={styles.heroCta}>
          <SignUpButton mode="modal">
            <button className={`${styles.btnPrimary} ${styles.btnPrimaryLg}`}>
              Get started
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className={styles.btnOutlineLg}>
              Sign in
            </button>
          </SignInButton>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.steps}>
        <div className={styles.stepsInner}>
          <div className={styles.sectionEyebrow}>How it works</div>
          <div className={styles.sectionTitle}>From the ER to one simple bill</div>
          <div className={styles.stepGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepTitle}>Connect or upload your EOBs</div>
              <p className={styles.stepDesc}>
                Link your insurance portal for automatic retrieval, or simply upload
                the paper EOBs and bills you received in the mail.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepTitle}>We decode and consolidate</div>
              <p className={styles.stepDesc}>
                Our system groups every claim from your incident into a single episode
                of care and translates medical codes into plain English.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepTitle}>We negotiate your discount</div>
              <p className={styles.stepDesc}>
                eSimplify offers providers an immediate, guaranteed payment in exchange
                for a reduced balance — a win for everyone.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepTitle}>Pay one lower amount</div>
              <p className={styles.stepDesc}>
                You pay the negotiated total through the platform. No more juggling
                multiple bills, due dates, or payment portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionEyebrow}>Why eSimplify</div>
          <div className={styles.sectionTitle}>Built for patients, not billing departments</div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><IconConsolidate /></div>
              <div className={styles.featureTitle}>Automatic consolidation</div>
              <p className={styles.featureDesc}>
                All EOBs and bills from a single visit are grouped into one clear
                episode of care so you see the full picture at once.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><IconNegotiate /></div>
              <div className={styles.featureTitle}>Expert negotiation</div>
              <p className={styles.featureDesc}>
                We leverage prompt-pay discounts and billing expertise to reduce
                what you owe — on average patients save 30% or more.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><IconPay /></div>
              <div className={styles.featureTitle}>One payment, zero confusion</div>
              <p className={styles.featureDesc}>
                Pay all your providers through a single secure transaction. We handle
                disbursement so you never miss a due date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>eSimplify Health</span>
        <span className={styles.footerCopy}>© {new Date().getFullYear()} eSimplify Health, Inc. All rights reserved.</span>
      </footer>
    </div>
  )
}
