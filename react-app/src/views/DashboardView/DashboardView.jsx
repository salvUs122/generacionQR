import './DashboardView.css'
import { formatBoliviaDate, formatBoliviaDateTime } from '../../utils/boliviaDateTime'

export function DashboardView({ profile, pendingDebts, currencyFormatter, boliviaNow }) {
  const pendingTotal = pendingDebts.reduce((acc, debt) => acc + debt.amount, 0)
  const nextDue = pendingDebts[0]
  const overdueCount = pendingDebts.filter((debt) => new Date(debt.dueAt) < new Date(boliviaNow)).length

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__heading">
          <div>
            <h1>Dashboard electrico</h1>
            <p>
              Cuenta {profile?.accountCode ?? '--'} - {profile?.serviceType ?? 'Energia electrica'}
            </p>
            <p className="dashboard__meta">
              Hora Bolivia: <strong>{formatBoliviaDateTime(boliviaNow)}</strong>
            </p>
          </div>
          <img className="dashboard__logo" src="/Logo.jpeg" alt="Logo del portal electrico" />
        </div>

        <div className="dashboard__kpis">
          <article>
            <p>Pendientes</p>
            <strong>{pendingDebts.length}</strong>
          </article>
          <article>
            <p>Total</p>
            <strong>{currencyFormatter.format(pendingTotal)}</strong>
          </article>
          <article>
            <p>Vencidas</p>
            <strong>{overdueCount}</strong>
          </article>
        </div>
      </header>

      <section className="cards-grid">
        <article className="info-card">
          <h2>Deudas pendientes</h2>
          <p>Solo se muestran periodos sin pagar.</p>
          <div className="detail-value">
            Registros pendientes: <strong>{pendingDebts.length}</strong>
            <br />
            Total pendiente: <strong>{currencyFormatter.format(pendingTotal)}</strong>
          </div>

          <div className="pending-list">
            {pendingDebts.length ? (
              pendingDebts.map((debt) => (
                <div className="pending-item" key={debt.id}>
                  <span className="pending-item__month">{debt.month}</span>
                  <span>{debt.consumptionKwh} kWh consumidos</span>
                  <span>Vence: {formatBoliviaDate(debt.dueAt)}</span>
                  <strong>{currencyFormatter.format(debt.amount)}</strong>
                </div>
              ))
            ) : (
              <p className="pending-list__empty">No hay deudas pendientes.</p>
            )}
          </div>
        </article>

        <article className="info-card">
          <h2>Estado</h2>
          <p>Estado de servicio y proximo vencimiento.</p>
          <div className="detail-value">
            Estado: <strong>{pendingDebts.length ? 'Con deudas pendientes' : 'Cuenta al dia'}</strong>
            <br />
            Proximo vencimiento:{' '}
            <strong>{nextDue ? formatBoliviaDateTime(nextDue.dueAt) : 'Sin pendientes'}</strong>
          </div>
          <p className="dashboard__help">
            Si deseas regularizar saldos, usa la vista <strong>Pagos QR</strong>.
          </p>
        </article>
      </section>
    </section>
  )
}
