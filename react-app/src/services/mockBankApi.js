const BANK_CONFIG_URL = '/mock-api/bank-config.json'

let bankConfigPromise

function randomPick(values) {
  return values[Math.floor(Math.random() * values.length)]
}

async function getBankConfig() {
  if (!bankConfigPromise) {
    bankConfigPromise = fetch(BANK_CONFIG_URL).then(async (response) => {
      if (!response.ok) {
        throw new Error('No se pudo cargar la configuracion JSON bancaria.')
      }
      return response.json()
    })
  }
  return bankConfigPromise
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
  const bankConfig = await getBankConfig()
  const issuedAt = Date.now()
  const amount = randomPick(bankConfig.amountOptions)
  const reference = `QR-${issuedAt}-${Math.floor(Math.random() * 1000)}`

  const payment = {
    merchantName: bankConfig.merchantName,
    merchantAccount: bankConfig.merchantAccount,
    amount,
    currency: bankConfig.currency,
    reference,
    expiresAt: new Date(issuedAt + bankConfig.expiresInMinutes * 60 * 1000).toISOString(),
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
