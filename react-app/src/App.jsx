import { useMemo, useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar/Sidebar'
import { QrPaymentView } from './views/QrPaymentView/QrPaymentView'
import { DashboardView } from './views/DashboardView/DashboardView'
import { LandingView } from './views/LandingView/LandingView'
import { LoginView } from './views/LoginView/LoginView'
import { loginWithMockCredentials, mockDebts, mockProfile } from './services/mockPortalApi'

const currencyFormatter = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
})

function App() {
  const [step, setStep] = useState('landing')
  const [activeView, setActiveView] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [debts, setDebts] = useState(mockDebts)

  const totals = useMemo(() => {
    const pendingTotal = debts
      .filter((debt) => debt.status === 'pending')
      .reduce((acc, debt) => acc + debt.amount, 0)
    const paidTotal = debts
      .filter((debt) => debt.status === 'paid')
      .reduce((acc, debt) => acc + debt.amount, 0)

    return {
      pendingTotal,
      paidTotal,
      pendingCount: debts.filter((debt) => debt.status === 'pending').length,
      paidCount: debts.filter((debt) => debt.status === 'paid').length,
    }
  }, [debts])

  const handleLogin = async (credentials) => {
    const nextSession = await loginWithMockCredentials(credentials)
    setSession(nextSession)
    setStep('portal')
    setActiveView('dashboard')
  }

  const handleLogout = () => {
    setSession(null)
    setStep('login')
    setActiveView('dashboard')
  }

  const handleConfirmPayment = (selectedIds) => {
    const paidAt = new Date().toISOString()
    setDebts((prev) =>
      prev.map((debt) =>
        selectedIds.includes(debt.id)
          ? {
              ...debt,
              status: 'paid',
              paidAt,
            }
          : debt,
      ),
    )
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
        profileName={session?.fullName ?? mockProfile.fullName}
      />

      <section className="content">
        {activeView === 'dashboard' ? (
          <DashboardView
            profile={session ?? mockProfile}
            debts={debts}
            totals={totals}
            currencyFormatter={currencyFormatter}
          />
        ) : null}
        {activeView === 'qr' ? (
          <QrPaymentView
            debts={debts}
            currencyFormatter={currencyFormatter}
            onConfirmPayment={handleConfirmPayment}
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
