const PORTAL_DATA_URL = '/mock-api/portal-data.json'

let portalDataPromise

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeText(text) {
  return String(text ?? '').trim()
}

async function getPortalData() {
  if (!portalDataPromise) {
    portalDataPromise = fetch(PORTAL_DATA_URL).then(async (response) => {
      if (!response.ok) {
        throw new Error('No se pudo cargar los datos JSON del portal.')
      }
      return response.json()
    })
  }
  return portalDataPromise
}

function sortDebtsByLatestPeriod(debts) {
  return [...debts].sort(
    (left, right) => new Date(right.periodEnd).getTime() - new Date(left.periodEnd).getTime(),
  )
}

export async function loginWithMockCredentials({ accountCode, ci, birthDate }) {
  await new Promise((resolve) => {
    setTimeout(resolve, 280)
  })

  const normalized = {
    accountCode: normalizeText(accountCode),
    ci: normalizeText(ci),
    birthDate: normalizeText(birthDate),
  }

  const portalData = await getPortalData()
  const validCredentials = portalData.credentials.some(
    (credential) =>
      credential.accountCode === normalized.accountCode &&
      credential.ci === normalized.ci &&
      credential.birthDate === normalized.birthDate,
  )

  if (!validCredentials) {
    throw new Error('Datos incorrectos. Revisa codigo de cuenta, CI o fecha de nacimiento.')
  }

  const account = portalData.accounts.find((item) => item.accountCode === normalized.accountCode)
  if (!account) {
    throw new Error('No se encontro informacion para esta cuenta electrica.')
  }

  return {
    ...clone(account.profile),
    accountCode: normalized.accountCode,
    ci: normalized.ci,
    birthDate: normalized.birthDate,
    loginAt: new Date().toISOString(),
  }
}

export async function loadAccountPortfolio(accountCode) {
  const portalData = await getPortalData()
  const normalizedAccountCode = normalizeText(accountCode)

  const account = portalData.accounts.find((item) => item.accountCode === normalizedAccountCode)
  if (!account) {
    throw new Error('No se pudo cargar la cartera de deudas del cliente.')
  }

  return {
    profile: {
      ...clone(account.profile),
      accountCode: normalizedAccountCode,
    },
    debts: sortDebtsByLatestPeriod(clone(account.debts)),
  }
}
