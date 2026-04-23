import { useMemo, useState } from 'react'
import QRCode from 'qrcode'
import './QrPaymentView.css'

export function QrPaymentView({ debts, currencyFormatter, onConfirmPayment }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [qrImage, setQrImage] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const pendingDebts = useMemo(
    () => debts.filter((debt) => debt.status === 'pending'),
    [debts],
  )

  const selectedDebts = useMemo(
    () => pendingDebts.filter((debt) => selectedIds.includes(debt.id)),
    [pendingDebts, selectedIds],
  )

  const selectedTotal = useMemo(
    () => selectedDebts.reduce((acc, debt) => acc + debt.amount, 0),
    [selectedDebts],
  )

  const toggleDebt = (debtId) => {
    setQrImage('')
    setPaymentReference('')
    setErrorMessage('')
    setSelectedIds((prev) =>
      prev.includes(debtId) ? prev.filter((id) => id !== debtId) : [...prev, debtId],
    )
  }

  const generateQr = async () => {
    if (!selectedDebts.length) {
      setErrorMessage('Selecciona al menos una deuda para generar el QR.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const reference = `PAGO-${Date.now()}`
      const qrPayload = {
        accountCode: '1234',
        source: 'demo-app',
        reference,
        total: selectedTotal,
        debts: selectedDebts.map((debt) => ({
          id: debt.id,
          concept: debt.concept,
          amount: debt.amount,
        })),
      }

      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 280,
        margin: 1,
      })

      setPaymentReference(reference)
      setQrImage(dataUrl)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo generar el QR de pago.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = () => {
    if (!selectedDebts.length) return
    onConfirmPayment(selectedIds)
    setSelectedIds([])
    setQrImage('')
    setPaymentReference('')
  }

  return (
    <section className="qr-view">
      <header className="qr-view__header">
        <h1 className="qr-view__title">Pagar deuda con QR</h1>
        <p className="qr-view__subtitle">
          Selecciona montos pendientes, genera el QR y luego confirma el pago.
        </p>
      </header>

      <section className="payment-card">
        <div className="payment-card__selector">
          <h2>Deudas disponibles</h2>
          <div className="debt-list">
            {pendingDebts.length ? (
              pendingDebts.map((debt) => (
                <label className="debt-item" key={debt.id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(debt.id)}
                    onChange={() => toggleDebt(debt.id)}
                  />
                  <span className="debt-item__text">
                    <strong>{debt.concept}</strong>
                    <span>{debt.month}</span>
                  </span>
                  <strong>{currencyFormatter.format(debt.amount)}</strong>
                </label>
              ))
            ) : (
              <p className="payment-card__placeholder">No hay deudas pendientes.</p>
            )}
          </div>

          <p className="payment-card__total">
            Total seleccionado: <strong>{currencyFormatter.format(selectedTotal)}</strong>
          </p>

          <div className="payment-card__actions">
            <button className="payment-card__button" type="button" onClick={generateQr}>
              {loading ? 'Generando...' : 'Generar QR'}
            </button>
            <button
              className="payment-card__button payment-card__button--success"
              type="button"
              disabled={!qrImage || !selectedDebts.length}
              onClick={confirmPayment}
            >
              Simular pago confirmado
            </button>
          </div>
        </div>

        <div className="payment-card__qr">
          {qrImage ? (
            <img src={qrImage} alt="Codigo QR de pago" width="280" height="280" />
          ) : (
            <div className="payment-card__placeholder">Selecciona deudas y genera el QR.</div>
          )}
          {paymentReference ? (
            <p className="payment-card__reference">Referencia: {paymentReference}</p>
          ) : null}
        </div>
      </section>

      {errorMessage ? <p className="qr-view__error">{errorMessage}</p> : null}
    </section>
  )
}
