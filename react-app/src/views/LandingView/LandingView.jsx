import './LandingView.css'

export function LandingView({ onContinue }) {
  return (
    <main className="landing">
      <section className="landing__hero">
        <p className="landing__eyebrow">paga tus facturas</p>
        <h1 className="landing__title">Paga tus consumos con QR en minutos</h1>
        <p className="landing__subtitle">
          Consulta deuda, selecciona montos pendientes y genera tu codigo QR.
          Por ahora funciona con datos quemados y luego se conectara con APIs.
        </p>
        <div className="landing__actions">
          <button className="landing__button" type="button" onClick={onContinue}>
            Ir al login
          </button>
        </div>
      </section>

      <section className="landing__features">
        <article className="feature-card">
          <h2>Control de deuda</h2>
          <p>Visualiza consumos y estado de pago en una sola vista.</p>
        </article>
        <article className="feature-card">
          <h2>Pago QR flexible</h2>
          <p>Selecciona una o varias deudas y genera un solo QR consolidado.</p>
        </article>
        <article className="feature-card">
          <h2>Preparado para API</h2>
          <p>La estructura ya esta separada para conectar backend en el siguiente paso.</p>
        </article>
      </section>
    </main>
  )
}
