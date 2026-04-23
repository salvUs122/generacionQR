const MOCK_MERCHANT = {
  merchantName: 'Comercio Demo S.A. de C.V.',
  merchantAccount: '646180157012345678',
}

const MOCK_AMOUNT_OPTIONS = [129.5, 240, 389.99, 525, 1120.45]

function randomPick(values) {
  return values[Math.floor(Math.random() * values.length)]
}

function buildBankQrPayload(payment) {
  return [
    `BANK=DEMO`,
    `MERCHANT=${payment.merchantName}`,
    `ACCOUNT=${payment.merchantAccount}`,
    `AMOUNT=${payment.amount.toFixed(2)}`,
    `CURRENCY=${payment.currency}`,
    `REFERENCE=${payment.reference}`,
    `EXPIRES_AT=${payment.expiresAt}`,
  ].join('|')
}

export async function createMockQrPayment() {
  const issuedAt = Date.now()
  const amount = randomPick(MOCK_AMOUNT_OPTIONS)
  const reference = `QR-${issuedAt}-${Math.floor(Math.random() * 1000)}`

  const payment = {
    ...MOCK_MERCHANT,
    amount,
    currency: 'MXN',
    reference,
    expiresAt: new Date(issuedAt + 5 * 60 * 1000).toISOString(),
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...payment,
        qrText: buildBankQrPayload(payment),
      })
    }, 300)
  })
}
