import { useMemo, useState } from 'react'
import { formatBoliviaDate, formatBoliviaDateTime } from '../../utils/boliviaDateTime'
import './ConsumptionView.css'

const RANGE_OPTIONS = [
  { key: 1, label: 'Ultimo mes' },
  { key: 3, label: 'Ultimos 3 meses' },
  { key: 6, label: 'Ultimos 6 meses' },
]

export function ConsumptionView({ debts, currencyFormatter }) {
  const [monthRange, setMonthRange] = useState(1)

  const orderedDebts = useMemo(
    () =>
      [...debts].sort(
        (left, right) => new Date(right.periodEnd).getTime() - new Date(left.periodEnd).getTime(),
      ),
    [debts],
  )

  const visibleDebts = useMemo(() => orderedDebts.slice(0, monthRange), [monthRange, orderedDebts])
  const visibleTotal = useMemo(
    () => visibleDebts.reduce((acc, debt) => acc + debt.amount, 0),
    [visibleDebts],
  )
  const visibleKwh = useMemo(
    () => visibleDebts.reduce((acc, debt) => acc + debt.consumptionKwh, 0),
    [visibleDebts],
  )
  const paidCount = useMemo(
    () => visibleDebts.filter((debt) => debt.status === 'paid').length,
    [visibleDebts],
  )

  return (
    <section className="consumption-view">
      <header className="consumption-view__header">
        <h1>Consumo electrico</h1>
        <p>Consulta tus periodos y revisa cuales ya fueron pagados.</p>
      </header>

      <div className="consumption-view__filters">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            className={`consumption-view__filter ${
              monthRange === option.key ? 'consumption-view__filter--active' : ''
            }`}
            type="button"
            onClick={() => setMonthRange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="consumption-summary">
        <article>
          <p>Energia total</p>
          <strong>{visibleKwh} kWh</strong>
        </article>
        <article>
          <p>Monto acumulado</p>
          <strong>{currencyFormatter.format(visibleTotal)}</strong>
        </article>
        <article>
          <p>Pagadas</p>
          <strong>
            {paidCount} / {visibleDebts.length}
          </strong>
        </article>
      </section>

      <section className="consumption-list">
        {visibleDebts.length ? (
          visibleDebts.map((debt) => (
            <article className="consumption-item" key={debt.id}>
              <div>
                <h2>{debt.month}</h2>
                <p>{debt.concept}</p>
                <p>
                  Lectura medidor: {debt.meterStart} kWh - {debt.meterEnd} kWh
                </p>
                <p>
                  Periodo: {formatBoliviaDate(debt.periodStart)} al {formatBoliviaDate(debt.periodEnd)}
                </p>
                <p>Vencimiento: {formatBoliviaDate(debt.dueAt)}</p>
              </div>

              <div className="consumption-item__stats">
                <strong>{debt.consumptionKwh} kWh</strong>
                <span>Tarifa: {currencyFormatter.format(debt.tariffPerKwh)} / kWh</span>
                <span>Total: {currencyFormatter.format(debt.amount)}</span>
                <span
                  className={`consumption-item__status ${
                    debt.status === 'paid'
                      ? 'consumption-item__status--paid'
                      : 'consumption-item__status--pending'
                  }`}
                >
                  {debt.status === 'paid'
                    ? `Pagado (${formatBoliviaDateTime(debt.paidAt)})`
                    : 'Pendiente de pago'}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="consumption-list__empty">No hay consumos para este rango.</p>
        )}
      </section>
    </section>
  )
}
