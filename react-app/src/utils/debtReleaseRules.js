export function getReleasedPendingDebtIds(debts) {
  const chronologicalDebts = [...debts].sort(
    (left, right) => new Date(left.periodEnd).getTime() - new Date(right.periodEnd).getTime(),
  )
  const releasedPendingIds = new Set()

  chronologicalDebts.forEach((debt, index) => {
    if (debt.status !== 'pending') return

    const previousTwoDebts = chronologicalDebts.slice(Math.max(0, index - 2), index)
    const canBeReleased =
      previousTwoDebts.length === 2 &&
      previousTwoDebts.every((previousDebt) => previousDebt.status === 'paid')

    if (canBeReleased) {
      releasedPendingIds.add(debt.id)
    }
  })

  return releasedPendingIds
}
