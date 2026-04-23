# Generador Automático de QR (Mock bancario)

Aplicación React que genera un QR de pago de forma automática usando datos quemados.

## Qué hace hoy

- Genera un nuevo QR al abrir la app.
- Refresca el QR automáticamente cada 30 segundos.
- Muestra datos simulados de comercio, cuenta, monto, referencia y expiración.
- Permite generar un QR manualmente con el botón **Generar nuevo QR**.

## Integración futura con API bancaria

La lógica de datos está separada en:

`src/services/mockBankApi.js`

Ese archivo se puede reemplazar por llamadas reales al banco sin cambiar la UI principal.

## Ejecutar

```bash
npm install
npm run dev
```
