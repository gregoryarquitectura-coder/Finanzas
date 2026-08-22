# Finanzas RMA

App personal de flujo de caja y control de cuentas. Reemplaza la versión de Google Sheets + Apps Script (`Flujo de caja/Code.gs` + `RMA_Gestion_Dinero.html`) con Next.js + Postgres real, mismo stack que [habit-tracker](../../06_INNOVACION_Y_PROTOTIPOS/Prototipos/habit-tracker).

## Editar cuentas, tipos, categorías y la regla de ruteo

Todo vive en **[config/finance.config.ts](config/finance.config.ts)**:

- `DEFAULT_ACCOUNTS`: cuentas que siembra la base de datos (`npm run db:seed`).
- `TIPOS_LIST` / `TIPO_LABELS` / `TIPO_SIGN`: los 5 tipos de movimiento y si suman (+1) o restan (-1) del saldo de la cuenta.
- `CATEGORIAS`: lista plana de categorías.
- `LINEAS_NEGOCIO`: qué categorías pertenecen a qué línea de negocio (RMA, Remodelación). Cualquier categoría que no esté en ninguna línea cae automáticamente en "Personal / Otros".
- `ROUTING_RULES`: la regla dura de ruteo (ej. "Inversión debería ir a Santander"). Agregar una regla nueva es un objeto más en el arreglo — no bloquea el guardado, solo marca el movimiento como fuera de regla en la UI.

Después del primer seed, las cuentas se administran desde la vista **Cuentas** (saldo inicial editable).

## 1. Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa DATABASE_URL / DIRECT_URL / FINANCE_PIN / AUTH_SECRET
npm run db:push
npm run db:seed
npm run dev
```

## 2. Base de datos, GitHub y Vercel

Mismo procedimiento que con Hábitos: crea un proyecto en Supabase, usa la connection string del **pooler** (Transaction para `DATABASE_URL`, Session para `DIRECT_URL` — la conexión "Directa" normal es IPv6-only y no conecta desde redes comunes), sube el repo a GitHub, e impórtalo en Vercel agregando las mismas variables de entorno que en `.env.local`.

## 3. Escanear boletas (OCR gratis)

La vista **Movimientos → 📷 Escanear boleta** lee el texto de la foto con OCR directo en el navegador ([tesseract.js](https://github.com/naptha/tesseract.js), sin costo ni API key) y con reglas simples (`lib/receiptParser.ts`) adivina monto, fecha y categoría, precargando el formulario de "Nuevo movimiento" — tú siempre eliges la tarjeta y confirmas.

No es tan preciso como una IA con visión — es reconocimiento de texto plano más heurísticas, así que hay que revisar todos los campos antes de guardar (el formulario muestra un aviso cuando vienen de un escaneo). Si más adelante quieres mejor precisión, se puede reemplazar por una API de visión (Claude, Google Vision, etc.) sin cambiar el resto del flujo — solo lo que pasa dentro de `ScanReceiptView.tsx`.

## 4. Integración con Cotizaciones RMA

`app/api/integrations/register-movement` deja que otras apps del ecosistema (hoy: [cotizaciones-rma](../../06_INNOVACION_Y_PROTOTIPOS/Prototipos/cotizaciones-rma)) registren un movimiento sin sesión de navegador — se autentica con el header `x-integration-key`, que debe coincidir con `INTEGRATION_SECRET`. No pasa por el PIN ni por la regla de ruteo del formulario (esa validación vive del lado de quien llama).

Body esperado:
```json
{ "date": "2026-08-20", "type": "INGRESO", "category": "Remodelacion / Obra", "accountKey": "negociorma", "description": "...", "amount": 150000, "notes": "" }
```

`accountKey` es la `key` estable de la cuenta (`santander`, `mercadopago`, `bancoestado`, `negociorma`, `efectivo`), no el id de la base de datos.

## Estructura

```
config/finance.config.ts   → cuentas, tipos, categorías, líneas de negocio, regla de ruteo (el único archivo a tocar)
prisma/schema.prisma        → modelos Account / Movement
lib/                          → saldos, regla de ruteo, líneas de negocio, agregados del dashboard, lectura de boletas
app/dashboard/                 → stats del mes, alertas, gráficos
app/movements/                  → lista + alta/edición de movimientos + escaneo de boletas
app/accounts/                    → saldo inicial editable + explicación de la regla de ruteo
app/business-lines/               → comparación RMA / Remodelación / Personal
```
