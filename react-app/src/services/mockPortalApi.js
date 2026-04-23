const VALID_CREDENTIALS = [
  { accountCode: '1234', ci: '87654321', birthDate: '15/07/1990' },
  { accountCode: '0000', ci: '12345678', birthDate: '01/01/1990' },
  { accountCode: '5678', ci: '11223344', birthDate: '22/05/1985' },
]

export const mockProfile = {
  fullName: 'Sofia Mercado Rivas',
  neighborhood: 'Zona demo',
  accountCode: '1234',
}

export const mockDebts = [
  {
    id: 'debt-032026',
    concept: 'Consumo Marzo 2026',
    month: 'Marzo 2026',
    amount: 12450,
    status: 'pending',
  },
  {
    id: 'debt-042026',
    concept: 'Consumo Abril 2026',
    month: 'Abril 2026',
    amount: 13820,
    status: 'pending',
  },
  {
    id: 'debt-012026',
    concept: 'Aporte redes nuevas',
    month: 'Enero 2026',
    amount: 8200,
    status: 'pending',
  },
  {
    id: 'debt-112025',
    concept: 'Consumo Noviembre 2025',
    month: 'Noviembre 2025',
    amount: 10990,
    status: 'paid',
    paidAt: '2026-01-12T13:00:00.000Z',
  },
]

export async function loginWithMockCredentials({ accountCode, ci, birthDate }) {
  await new Promise((resolve) => {
    setTimeout(resolve, 350)
  })

  const valid = VALID_CREDENTIALS.some(
    (item) =>
      item.accountCode === accountCode && item.ci === ci && item.birthDate === birthDate,
  )

  if (!valid) {
    throw new Error('Datos incorrectos. Revisa codigo, CI o fecha.')
  }

  return {
    ...mockProfile,
    accountCode,
    ci,
    birthDate,
    loginAt: new Date().toISOString(),
  }
}
