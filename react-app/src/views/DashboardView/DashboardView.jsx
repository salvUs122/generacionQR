import './DashboardView.css'

export function DashboardView({ profile, totals, currencyFormatter, debts }) {
  const nextDue = debts.find((item) => item.status === 'pending')

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Panel general</h1>
          <p>
            Consulta consumos, deuda acumulada y estado general para tu
            cuenta {profile.accountCode}.
          </p>
        </div>
      </header>

      <section className="cards-grid">
        <article className="info-card">
          <h2>Consumo</h2>
          <p>Ultimo registro de consumo y monto aproximado.</p>
          <div className="detail-value">
            Ultimo mes: <strong>24 m3</strong>
            <br />
            Monto del periodo: <strong>{currencyFormatter.format(12450)}</strong>
          </div>
        </article>

        <article className="info-card">
          <h2>Deudas pendientes</h2>
          <p>Resumen de montos listos para pago QR.</p>
          <div className="detail-value">
            Registros pendientes: <strong>{totals.pendingCount}</strong>
            <br />
            Total pendiente: <strong>{currencyFormatter.format(totals.pendingTotal)}</strong>
          </div>
        </article>

        <article className="info-card">
          <h2>Pagos aplicados</h2>
          <p>Movimientos ya conciliados.</p>
          <div className="detail-value">
            Registros pagados: <strong>{totals.paidCount}</strong>
            <br />
            Total pagado: <strong>{currencyFormatter.format(totals.paidTotal)}</strong>
          </div>
        </article>

        <article className="info-card">
          <h2>Estado general</h2>
          <p>No se detectan observaciones activas.</p>
          <div className="detail-value">
            Estado: <strong>Activo y normal</strong>
            <br />
            Proximo vencimiento: <strong>{nextDue?.month ?? 'Sin pendientes'}</strong>
          </div>
        </article>
      </section>
    </section>
  )
}
