import './LandingView.css'

export function LandingView({ onContinue }) {
  return (
    <main className="landing">
      <section className="landing__hero">
        <div className="landing__hero-grid">
          <div className="landing__hero-content">
            <p className="landing__eyebrow">portal de energia electrica</p>
            <h1 className="landing__title">Gestiona tu consumo electrico y paga con QR</h1>
            <p className="landing__subtitle">Rapido, claro y 100% enfocado en tu cuenta.</p>
            <div className="landing__chips">
              <span>Lecturas mensuales en kWh</span>
              <span>Fecha y hora Bolivia en vivo</span>
              <span>Historial de pagos actualizado</span>
            </div>
            <div className="landing__actions">
              <button className="landing__button" type="button" onClick={onContinue}>
                Iniciar sesion
              </button>
            </div>
            <p className="landing__login-note">
              Primero debes iniciar sesion para entrar al portal cliente.
            </p>
          </div>

          <aside className="landing__visual-card" aria-hidden="true">
            <div className="landing__logo-wrap">
              <img className="landing__logo--spin" src="/Logo.jpeg" alt="" />
            </div>
          </aside>
        </div>
      </section>

      <section className="landing__features">
        <article className="feature-card">
          <span className="feature-card__badge">01</span>
          <h2>Deuda por consumo</h2>
          <p>kWh, tarifa y estado mensual.</p>
        </article>
        <article className="feature-card">
          <span className="feature-card__badge">02</span>
          <h2>Pago QR electrico</h2>
          <p>Selecciona periodos y paga en un paso.</p>
        </article>
        <article className="feature-card">
          <span className="feature-card__badge">03</span>
          <h2>Ingreso seguro</h2>
          <p>Acceso por login antes de usar el portal.</p>
        </article>
      </section>
    </main>
  )
}
