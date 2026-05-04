import { useState } from 'react'
import './LoginView.css'

const DEFAULT_FORM = {
  accountCode: '1234',
  ci: '87654321',
  birthDate: '1990-07-15',
}

function toCredentialsBirthDate(value) {
  const normalized = String(value ?? '').trim()
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return normalized
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

export function LoginView({ onLogin, onBack }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onChange = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      await onLogin({
        ...form,
        birthDate: toCredentialsBirthDate(form.birthDate),
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesion con esos datos.'
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__header">
          <div className="login-card__header-top">
            <img className="login-card__logo" src="/Logo.jpeg" alt="Logo del portal electrico" />
            <p className="login-card__tag">Portal electrico</p>
          </div>
          <h1>Ingresa a tu cuenta de energia</h1>
          <p>Usa Codigo de Cuenta, CI y Fecha de Nacimiento.</p>
        </div>

        <div className="login-card__body">
          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-field">
              Codigo de Cuenta
              <input
                type="text"
                value={form.accountCode}
                onChange={onChange('accountCode')}
                placeholder="0000"
                autoComplete="off"
              />
            </label>

            <label className="login-field">
              Cedula de Identidad (CI)
              <input
                type="text"
                value={form.ci}
                onChange={onChange('ci')}
                placeholder="Ej: 12345678"
                autoComplete="off"
              />
            </label>

            <label className="login-field">
              Fecha de Nacimiento
              <input
                type="date"
                value={form.birthDate}
                onChange={onChange('birthDate')}
                autoComplete="off"
              />
            </label>

            {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

            <div className="login-actions">
              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? 'Validando...' : 'Ingresar'}
              </button>
              <button className="login-back" type="button" onClick={onBack}>
                Volver
              </button>
            </div>
            <p className="login-hint">Controla tu consumo y pagos de electricidad</p>
          </form>
        </div>
      </section>
    </main>
  )
}
