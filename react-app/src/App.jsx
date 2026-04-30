import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar/Sidebar'
import { QrPaymentView } from './views/QrPaymentView/QrPaymentView'
import { DashboardView } from './views/DashboardView/DashboardView'
import { LandingView } from './views/LandingView/LandingView'
import { LoginView } from './views/LoginView/LoginView'
import { ConsumptionView } from './views/ConsumptionView/ConsumptionView'
import { loadAccountPortfolio, loginWithMockCredentials } from './services/mockPortalApi'
import { getReleasedPendingDebtIds } from './utils/debtReleaseRules'

const currencyFormatter = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
})

function App() {
  const [step, setStep] = useState('landing')
  const [activeView, setActiveView] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState([])
  const [boliviaNow, setBoliviaNow] = useState(() => new Date().toISOString())

  useEffect(() => {
    const timerId = setInterval(() => {
      setBoliviaNow(new Date().toISOString())
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

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
    setStep('portal')
    setActiveView('dashboard')
  }

  const handleLogout = () => {
    setSession(null)
    setProfile(null)
    setDebts([])
    setStep('login')
    setActiveView('dashboard')
  }

  const handleConfirmPayment = (selectedIds) => {
    const paidAt = new Date().toISOString()
    setDebts((prev) => {
      const releasedPendingIds = getReleasedPendingDebtIds(prev)
      const selectedReleasedIds = new Set(
        selectedIds.filter((id) => releasedPendingIds.has(id)),
      )

      if (!selectedReleasedIds.size) {
        return prev
      }

      return prev.map((debt) =>
        selectedReleasedIds.has(debt.id)
          ? {
              ...debt,
              status: 'paid',
              paidAt,
            }
          : debt,
      )
    })
  }

  if (step === 'landing') {
    return <LandingView onContinue={() => setStep('login')} />
  }

  if (step === 'login') {
    return <LoginView onBack={() => setStep('landing')} onLogin={handleLogin} />
  }

  return (
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
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
