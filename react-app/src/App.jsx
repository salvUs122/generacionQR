import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar/Sidebar'
import { QrPaymentView } from './views/QrPaymentView/QrPaymentView'
import { DashboardView } from './views/DashboardView/DashboardView'
import { LandingView } from './views/LandingView/LandingView'
import { LoginView } from './views/LoginView/LoginView'
import { ConsumptionView } from './views/ConsumptionView/ConsumptionView'
import { ReceiptsView } from './views/ReceiptsView/ReceiptsView'
import { loadAccountPortfolio, loginWithMockCredentials } from './services/mockPortalApi'
import { getReleasedPendingDebtIds } from './utils/debtReleaseRules'

const currencyFormatter = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
})

function buildHistoricalReceipts(debts, accountProfile) {
  return debts
    .filter((debt) => debt.status === 'paid' && debt.paidAt)
    .sort((left, right) => new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime())
    .map((debt) => ({
      id: `RCPT-HIST-${debt.id.toUpperCase()}`,
      reference: `HIST-${debt.id.toUpperCase()}`,
      paidAt: debt.paidAt,
      total: debt.amount,
      customerName: accountProfile?.fullName ?? 'Cliente',
      accountCode: accountProfile?.accountCode ?? '--',
      serviceType: accountProfile?.serviceType ?? 'Energia electrica residencial',
      items: [
        {
          id: debt.id,
          concept: debt.concept,
          month: debt.month,
          consumptionKwh: debt.consumptionKwh,
          amount: debt.amount,
        },
      ],
    }))
}

function getCurrentScreen(step, activeView) {
  if (step === 'portal') {
    return activeView
  }
  return step
}

function App() {
  const [step, setStep] = useState('landing')
  const [activeView, setActiveView] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState([])
  const [receipts, setReceipts] = useState([])
  const [showTransitionLogo, setShowTransitionLogo] = useState(false)
  const [boliviaNow, setBoliviaNow] = useState(() => new Date().toISOString())
  const previousScreenRef = useRef(getCurrentScreen(step, activeView))

  useEffect(() => {
    const timerId = setInterval(() => {
      setBoliviaNow(new Date().toISOString())
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

  useEffect(() => {
    const currentScreen = getCurrentScreen(step, activeView)
    const previousScreen = previousScreenRef.current
    previousScreenRef.current = currentScreen

    if (currentScreen === previousScreen) {
      return
    }

    const shouldAnimate =
      (previousScreen === 'landing' && currentScreen === 'login') ||
      (previousScreen === 'login' && currentScreen === 'landing') ||
      (previousScreen === 'login' && currentScreen === 'dashboard') ||
      (previousScreen === 'dashboard' && currentScreen === 'login')

    if (!shouldAnimate) {
      return
    }

    setShowTransitionLogo(true)
    const timerId = setTimeout(() => {
      setShowTransitionLogo(false)
    }, 1000)

    return () => {
      clearTimeout(timerId)
    }
  }, [step, activeView])

  const pendingDebts = useMemo(
    () =>
      debts
        .filter((debt) => debt.status === 'pending')
        .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()),
    [debts],
  )

  const handleLogin = async (credentials) => {
    const nextSession = await loginWithMockCredentials(credentials)
    const portfolio = await loadAccountPortfolio(nextSession.accountCode)

    setSession(nextSession)
    setProfile(portfolio.profile)
    setDebts(portfolio.debts)
    setReceipts(buildHistoricalReceipts(portfolio.debts, portfolio.profile))
    setStep('portal')
    setActiveView('dashboard')
  }

  const handleLogout = () => {
    setSession(null)
    setProfile(null)
    setDebts([])
    setReceipts([])
    setStep('login')
    setActiveView('dashboard')
  }

  const handleConfirmPayment = ({ selectedIds, reference }) => {
    const paidAt = new Date().toISOString()
    const releasedPendingIds = getReleasedPendingDebtIds(debts)
    const selectedReleasedIds = new Set(selectedIds.filter((id) => releasedPendingIds.has(id)))
    const selectedDebts = debts.filter(
      (debt) => selectedReleasedIds.has(debt.id) && debt.status === 'pending',
    )

    if (!selectedDebts.length) {
      return false
    }

    setDebts((prev) =>
      prev.map((debt) =>
        selectedReleasedIds.has(debt.id)
          ? {
              ...debt,
              status: 'paid',
              paidAt,
            }
          : debt,
      ),
    )

    const receiptSeed = Date.now()
    const receipt = {
      id: `RCPT-${receiptSeed}`,
      reference: reference || `ELEC-${receiptSeed}`,
      paidAt,
      total: selectedDebts.reduce((acc, debt) => acc + debt.amount, 0),
      customerName: session?.fullName ?? profile?.fullName ?? 'Cliente',
      accountCode: session?.accountCode ?? profile?.accountCode ?? '--',
      serviceType: profile?.serviceType ?? 'Energia electrica residencial',
      items: selectedDebts.map((debt) => ({
        id: debt.id,
        concept: debt.concept,
        month: debt.month,
        consumptionKwh: debt.consumptionKwh,
        amount: debt.amount,
      })),
    }

    setReceipts((prev) => [receipt, ...prev])
    return true
  }

  let pageContent = null

  if (step === 'landing') {
    pageContent = <LandingView onContinue={() => setStep('login')} />
  } else if (step === 'login') {
    pageContent = <LoginView onBack={() => setStep('landing')} onLogin={handleLogin} />
  } else {
    pageContent = (
      <main className="app">
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          onLogout={handleLogout}
          profileName={session?.fullName ?? profile?.fullName ?? 'Cliente'}
        />

        <section className="content">
          {activeView === 'dashboard' ? (
            <DashboardView
              profile={profile ?? session}
              pendingDebts={pendingDebts}
              currencyFormatter={currencyFormatter}
              boliviaNow={boliviaNow}
            />
          ) : null}
          {activeView === 'consumption' ? (
            <ConsumptionView debts={debts} currencyFormatter={currencyFormatter} />
          ) : null}
          {activeView === 'qr' ? (
            <QrPaymentView
              debts={debts}
              currencyFormatter={currencyFormatter}
              onConfirmPayment={handleConfirmPayment}
              boliviaNow={boliviaNow}
              onOpenReceipts={() => setActiveView('receipts')}
            />
          ) : null}
          {activeView === 'receipts' ? (
            <ReceiptsView receipts={receipts} currencyFormatter={currencyFormatter} />
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <>
      {pageContent}
      {showTransitionLogo ? (
        <div className="app-transition-logo" role="status" aria-live="polite">
          <img src="/Logo.jpeg" alt="Logo del portal electrico" />
        </div>
      ) : null}
    </>
  )
}

export default App
