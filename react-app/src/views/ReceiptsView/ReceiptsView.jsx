import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { formatBoliviaDateTime } from '../../utils/boliviaDateTime'
import './ReceiptsView.css'

function normalizeFileName(value) {
  return String(value).replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-')
}

export function ReceiptsView({ receipts, currencyFormatter }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [previewReference, setPreviewReference] = useState('')

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl)
      }
    }
  }, [previewPdfUrl])

  const orderedReceipts = useMemo(
    () =>
      [...receipts].sort((left, right) => new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime()),
    [receipts],
  )

  const totalBilled = useMemo(
    () => orderedReceipts.reduce((acc, receipt) => acc + receipt.total, 0),
    [orderedReceipts],
  )

  const closePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
    }
    setPreviewPdfUrl('')
    setPreviewReference('')
  }

  const createReceiptPdf = (receipt) => {
    const doc = new jsPDF()
    let y = 18

    const ensureSpace = (requiredHeight = 8) => {
      if (y + requiredHeight <= 280) return
      doc.addPage()
      y = 18
    }

    doc.setFontSize(16)
    doc.text('Recibo de pago - Energia electrica', 14, y)
    y += 10

    doc.setFontSize(11)
    doc.text(`Nro recibo: ${receipt.id}`, 14, y)
    y += 6
    doc.text(`Referencia: ${receipt.reference}`, 14, y)
    y += 6
    doc.text(`Cuenta: ${receipt.accountCode}`, 14, y)
    y += 6
    doc.text(`Cliente: ${receipt.customerName}`, 14, y)
    y += 6
    doc.text(`Servicio: ${receipt.serviceType}`, 14, y)
    y += 6
    doc.text(`Pagado en: ${formatBoliviaDateTime(receipt.paidAt)}`, 14, y)
    y += 10

    doc.setFontSize(12)
    doc.text('Detalle facturado', 14, y)
    y += 8
    doc.setFontSize(10)

    receipt.items.forEach((item, index) => {
      ensureSpace(16)
      doc.text(`${index + 1}. ${item.month} - ${item.concept}`, 14, y)
      y += 5
      doc.text(`Consumo: ${item.consumptionKwh} kWh`, 20, y)
      y += 5
      doc.text(`Monto: ${currencyFormatter.format(item.amount)}`, 20, y)
      y += 6
    })

    ensureSpace(10)
    doc.setFontSize(12)
    doc.text(`Total pagado: ${currencyFormatter.format(receipt.total)}`, 14, y)

    return doc
  }

  const previewReceiptPdf = (receipt) => {
    try {
      const doc = createReceiptPdf(receipt)
      const blob = doc.output('blob')
      const nextUrl = URL.createObjectURL(blob)

      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl)
      }

      setPreviewPdfUrl(nextUrl)
      setPreviewReference(receipt.reference)
      setErrorMessage('')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo generar la vista previa del recibo.'
      setErrorMessage(message)
    }
  }

  const downloadReceiptPdf = (receipt) => {
    try {
      const doc = createReceiptPdf(receipt)
      const pdfName = normalizeFileName(`recibo-${receipt.reference}.pdf`)
      doc.save(pdfName)
      setErrorMessage('')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo descargar el PDF del recibo.'
      setErrorMessage(message)
    }
  }

  return (
    <section className="receipts-view">
      <header className="receipts-view__header">
        <h1>Facturas y recibos</h1>
        <p>Aqui se guarda cada pago confirmado. Puedes descargar cualquier recibo en PDF.</p>
      </header>

      <section className="receipts-view__summary">
        <article>
          <p>Recibos emitidos</p>
          <strong>{orderedReceipts.length}</strong>
        </article>
        <article>
          <p>Total facturado</p>
          <strong>{currencyFormatter.format(totalBilled)}</strong>
        </article>
      </section>

      <section className="receipts-list">
        {orderedReceipts.length ? (
          orderedReceipts.map((receipt) => (
            <article className="receipts-item" key={receipt.id}>
              <div className="receipts-item__head">
                <div>
                  <h2>{receipt.reference}</h2>
                  <p>Pagado: {formatBoliviaDateTime(receipt.paidAt)}</p>
                  <p>
                    Cuenta {receipt.accountCode} - {receipt.customerName}
                  </p>
                </div>
                <strong>{currencyFormatter.format(receipt.total)}</strong>
              </div>

              <div className="receipts-item__body">
                {receipt.items.map((item) => (
                  <p key={item.id}>
                    {item.month} - {item.concept} - {item.consumptionKwh} kWh -{' '}
                    {currencyFormatter.format(item.amount)}
                  </p>
                ))}
              </div>

              <div className="receipts-item__actions">
                <button
                  type="button"
                  className="receipts-item__action receipts-item__action--secondary"
                  onClick={() => previewReceiptPdf(receipt)}
                >
                  Ver recibo
                </button>
                <button
                  type="button"
                  className="receipts-item__action"
                  onClick={() => downloadReceiptPdf(receipt)}
                >
                  Descargar PDF
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="receipts-list__empty">Aun no tienes recibos disponibles.</p>
        )}
      </section>

      {errorMessage ? <p className="receipts-view__error">{errorMessage}</p> : null}

      {previewPdfUrl ? (
        <section className="receipts-preview" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="receipts-preview__backdrop" onClick={closePreview} />
          <article className="receipts-preview__content">
            <header className="receipts-preview__header">
              <h2 id="preview-title">Vista previa: {previewReference}</h2>
              <button type="button" className="receipts-preview__close" onClick={closePreview}>
                Cerrar
              </button>
            </header>
            <iframe className="receipts-preview__frame" src={previewPdfUrl} title={`Recibo ${previewReference}`} />
          </article>
        </section>
      ) : null}
    </section>
  )
}
