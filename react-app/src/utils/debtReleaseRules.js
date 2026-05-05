export function getReleasedPendingDebtIds(debts, { virtualPaidIds = [] } = {}) {
  const chronologicalDebts = [...debts].sort(
    (left, right) => new Date(left.periodEnd).getTime() - new Date(right.periodEnd).getTime(),
  )
  const releasedPendingIds = new Set()
  const paidDebtIds = new Set(
    chronologicalDebts.filter((debt) => debt.status === 'paid').map((debt) => debt.id),
  )
  const requestedVirtualPaidIds = new Set(virtualPaidIds)

  chronologicalDebts.forEach((debt, index) => {
    if (debt.status !== 'pending') return

    const previousTwoDebts = chronologicalDebts.slice(Math.max(0, index - 2), index)
    const canBeReleased =
      previousTwoDebts.length === 2 && previousTwoDebts.every((previousDebt) => paidDebtIds.has(previousDebt.id))

    if (canBeReleased) {
      releasedPendingIds.add(debt.id)

      if (requestedVirtualPaidIds.has(debt.id)) {
        paidDebtIds.add(debt.id)
      }
    }
  })

  return releasedPendingIds
}
