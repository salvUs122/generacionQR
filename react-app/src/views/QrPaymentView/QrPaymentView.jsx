import { useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { formatBoliviaDate, formatBoliviaDateTime } from '../../utils/boliviaDateTime'
import { getReleasedPendingDebtIds } from '../../utils/debtReleaseRules'
import './QrPaymentView.css'

export function QrPaymentView({
  debts,
  currencyFormatter,
  onConfirmPayment,
  boliviaNow,
  onOpenReceipts,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [qrImage, setQrImage] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [qrIssuedAt, setQrIssuedAt] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const pendingDebts = useMemo(
    () =>
      debts
        .filter((debt) => debt.status === 'pending')
        .sort(
          (left, right) => new Date(right.periodEnd).getTime() - new Date(left.periodEnd).getTime(),
        ),
    [debts],
  )

  const releasedPendingIds = useMemo(() => getReleasedPendingDebtIds(debts), [debts])

  const selectedDebts = useMemo(
    () =>
      pendingDebts.filter(
        (debt) => selectedIds.includes(debt.id) && releasedPendingIds.has(debt.id),
      ),
    [pendingDebts, selectedIds, releasedPendingIds],
  )

  const selectedTotal = useMemo(
    () => selectedDebts.reduce((acc, debt) => acc + debt.amount, 0),
    [selectedDebts],
  )

  const paymentHistory = useMemo(
    () =>
      debts
        .filter((debt) => debt.status === 'paid' && debt.paidAt)
        .sort((left, right) => new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime()),
    [debts],
  )

  const toggleDebt = (debtId) => {
    if (!releasedPendingIds.has(debtId)) return

    setQrImage('')
    setPaymentReference('')
    setQrIssuedAt('')
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
      const reference = `ELEC-${Date.now()}`
      const qrPayload = {
        source: 'portal-electrico',
        generatedAtBolivia: formatBoliviaDateTime(boliviaNow),
        reference,
        total: selectedTotal,
        debts: selectedDebts.map((debt) => ({
          id: debt.id,
          concept: debt.concept,
          month: debt.month,
          consumptionKwh: debt.consumptionKwh,
          amount: debt.amount,
        })),
      }

      const dataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 280,
        margin: 1,
      })

      setPaymentReference(reference)
      setQrIssuedAt(formatBoliviaDateTime(boliviaNow))
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
    const wasConfirmed = onConfirmPayment({
      selectedIds: selectedDebts.map((debt) => debt.id),
      reference: paymentReference,
    })

    if (!wasConfirmed) {
      setErrorMessage('No se pudo confirmar el pago. Genera el QR nuevamente e intenta otra vez.')
      return
    }

    setSelectedIds([])
    setQrImage('')
    setPaymentReference('')
    setQrIssuedAt('')
    setErrorMessage('')
    setShowSuccessModal(true)
  }

  return (
    <section className="qr-view">
      <header className="qr-view__header">
        <h1 className="qr-view__title">Pago QR de energia electrica</h1>
        <p className="qr-view__subtitle">
          Selecciona consumos pendientes de electricidad y genera un QR unico.
        </p>
        <p className="qr-view__subtitle">Hora Bolivia: {formatBoliviaDateTime(boliviaNow)}</p>
      </header>

      <section className="payment-card">
        <div className="payment-card__selector">
          <div className="payment-card__selector-head">
            <h2>Deudas electricas disponibles</h2>
            <span>{selectedDebts.length} seleccionadas</span>
          </div>

          <div className="payment-card__summary">
            <p>Solo se libera una deuda si los 2 pagos anteriores estan pagados.</p>
            <strong>{currencyFormatter.format(selectedTotal)}</strong>
          </div>

          <div className="debt-list">
            {pendingDebts.length ? (
              pendingDebts.map((debt) => {
                const isReleased = releasedPendingIds.has(debt.id)

                return (
                  <label className={`debt-item ${isReleased ? '' : 'debt-item--locked'}`} key={debt.id}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(debt.id) && isReleased}
                      disabled={!isReleased}
                      onChange={() => toggleDebt(debt.id)}
                    />
                    <span className="debt-item__text">
                      <strong>{debt.concept}</strong>
                      <span>
                        {debt.month} - {debt.consumptionKwh} kWh
                      </span>
                      <span className="debt-item__due">Vence: {formatBoliviaDate(debt.dueAt)}</span>
                      {!isReleased ? (
                        <span className="debt-item__lock">
                          Bloqueada hasta que los 2 pagos anteriores esten pagados.
                        </span>
                      ) : null}
                    </span>
                    <strong>{currencyFormatter.format(debt.amount)}</strong>
                  </label>
                )
              })
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
              Confirmar pago
            </button>
          </div>
        </div>

        <div className="payment-card__qr">
          {qrImage ? (
            <img className="payment-card__qr-image" src={qrImage} alt="Codigo QR de pago" />
          ) : (
            <div className="payment-card__placeholder">
              Selecciona deudas y genera el QR para iniciar el pago.
            </div>
          )}
          {paymentReference ? (
            <p className="payment-card__reference">Referencia: {paymentReference}</p>
          ) : null}
          {qrIssuedAt ? <p className="payment-card__reference">Generado: {qrIssuedAt}</p> : null}
        </div>
      </section>

      <section className="history-card">
        <h2>Historial de pagos</h2>
        {paymentHistory.length ? (
          <div className="history-list">
            {paymentHistory.map((item) => (
              <article className="history-item" key={item.id}>
                <div>
                  <strong>{item.concept}</strong>
                  <p>{item.month}</p>
                </div>
                <div>
                  <strong>{currencyFormatter.format(item.amount)}</strong>
                  <p>Pagado: {formatBoliviaDateTime(item.paidAt)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="history-empty">Aun no hay pagos confirmados.</p>
        )}
      </section>

      {errorMessage ? <p className="qr-view__error">{errorMessage}</p> : null}

      {showSuccessModal ? (
        <section className="qr-success-modal" role="dialog" aria-modal="true" aria-labelledby="payment-ok-title">
          <div className="qr-success-modal__backdrop" onClick={() => setShowSuccessModal(false)} />
          <article className="qr-success-modal__content">
            <h3 id="payment-ok-title" className="qr-success-modal__title">
              <span role="img" aria-label="bien">
                ✅
              </span>{' '}
              Pago exitoso
            </h3>
            <p>Tu pago fue registrado correctamente.</p>
            <p>
              Revisa la facturacion en <strong>Recibos</strong>. Desde ahi podras descargar el recibo en PDF.
            </p>
            <div className="qr-success-modal__actions">
              <button
                type="button"
                className="qr-success-modal__button"
                onClick={() => {
                  setShowSuccessModal(false)
                  onOpenReceipts?.()
                }}
              >
                Ir a Recibos
              </button>
              <button
                type="button"
                className="qr-success-modal__button qr-success-modal__button--ghost"
                onClick={() => setShowSuccessModal(false)}
              >
                Cerrar
              </button>
            </div>
          </article>
        </section>
      ) : null}
    </section>
  )
}
