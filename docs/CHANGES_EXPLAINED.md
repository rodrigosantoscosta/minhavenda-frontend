# What Changed and Why — 2026-03-07

This document explains the two frontend changes made to `minhavenda-frontend`
in plain terms, covering *what* was done, *why* it was done, and *what you
should understand* about each decision.

---

## 1. `src/services/notificationService.js` — Polling → SSE

### What was it before?

The service used `setInterval` to call `getMyOrders()` every 30 seconds,
then compared the returned statuses against a snapshot saved in `localStorage`.
If a status had changed, it fired an in-app notification.

```
[frontend] ──── every 30s: GET /pedidos ────► [backend]
                ◄──── list of orders ─────────
                diff statuses in localStorage → fire notification
```

This is called **polling**. It works but has downsides:
- The browser makes a network request even when nothing changed.
- The notification can arrive up to 30 seconds late.
- Every logged-in tab polls independently, multiplying the load.

### What is it now?

The service opens a **persistent HTTP connection** to `GET /api/pedidos/stream`
and listens for **Server-Sent Events (SSE)**. The backend pushes an event the
moment the RabbitMQ consumer processes an order status change — no waiting,
no unnecessary requests.

```
[frontend] ──── GET /pedidos/stream ────────► [backend]
           ◄──── keeps connection open ───────
           ◄──── event: pedido.pago  ──────── (pushed by backend instantly)
           ◄──── event: pedido.enviado ──────
```

### Why use `fetch` instead of native `EventSource`?

This is the most important technical decision in the change.

The browser's built-in `EventSource` API cannot send custom HTTP headers.
That means you cannot pass `Authorization: Bearer <token>` — the backend
would reject the connection as unauthenticated.

Using `fetch` with a `ReadableStream` lets you send exactly the same
`Authorization` header as every other API call:

```js
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
  signal: abortController.signal,
})
```

### How does the SSE parser work?

SSE is a plain-text protocol. Each event is a block of lines separated by a
blank line:

```
event: pedido.pago
data: {"pedidoId":"abc-123","metodoPagamento":"PIX","usuarioId":"..."}

event: pedido.enviado
data: {"pedidoId":"abc-123","codigoRastreio":"BR999","transportadora":"Correios","usuarioId":"..."}

```

The parser in `readSseStream()` reads the stream chunk by chunk, splits on
newlines, accumulates `event:` and `data:` fields, and fires `onEvent` when
it hits a blank line (the end-of-block signal).

### How does reconnection work?

If the network drops or the server closes the stream, `connectSse()` catches
the error and calls `scheduleReconnect()`, which waits 5 seconds then calls
`connectSse()` again. The only exception is an `AbortError`, which means
`stopPolling()` was called intentionally (logout) — in that case we do not
reconnect.

### What stayed the same (API contract)?

`startPolling(addNotification, token)`, `stopPolling()`, and
`registerOrderStatus(orderId, status)` keep the same names and signatures.
`AuthContext` and `checkoutService` call them without knowing anything about
the internal implementation — they did not need to change.

One difference: `startPolling` now requires the JWT `token` as a second
argument, since `EventSource` cannot send it automatically. The caller
(currently `AuthContext`) must pass `authService.getToken()` when starting
the connection.

> **Action required:** Update the `startPolling` call in `AuthContext.jsx`
> to pass the token:
> ```js
> startPolling(addNotification, authService.getToken())
> ```

---

## 2. `src/services/api.js` — Handle HTTP 429 (Rate Limiting)

### What was it before?

The Axios response interceptor had a `switch(status)` block handling 401, 403,
404, 500, and 503. HTTP **429 Too Many Requests** was not handled, so it fell
into the `default` branch — only a log line, nothing shown to the user.

### What changed?

A `case 429` block was added:

```js
case 429: {
  const retryAfter = error.response?.headers?.['retry-after']
  const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
  logger.warn({ url, retryAfter: seconds }, 'Rate limit atingido')
  window.dispatchEvent(new CustomEvent('api:rate-limited', { detail: { seconds, url } }))
  break
}
```

### Why does this matter?

The backend added **Bucket4j rate limiting** on `/auth/login` and
`/auth/register` — maximum 10 requests per minute per IP. If a user clicks
the login button repeatedly (or a bot hammers the endpoint), the backend
returns 429 with a `Retry-After` header indicating how many seconds to wait.

Without this case, the user sees a generic spinner or nothing at all.
With this case, the app fires a `CustomEvent` that any component can listen
to and display a meaningful message:

```js
// Example in Login.jsx:
useEffect(() => {
  const handler = (e) => setError(`Muitas tentativas. Tente novamente em ${e.detail.seconds}s.`)
  window.addEventListener('api:rate-limited', handler)
  return () => window.removeEventListener('api:rate-limited', handler)
}, [])
```

### Why a CustomEvent instead of a direct call?

The interceptor in `api.js` has no access to React state or component
`setState`. A `CustomEvent` on `window` is the standard way to communicate
from outside the React tree back into components — the same pattern already
used in this project for `auth:unauthorized`.

> **Action required (manual):** The `replace_content` edit to `api.js` was
> blocked by a Serena language server issue in this session. Apply the
> `case 429` block manually as shown above, and add the event listener to
> `Login.jsx` and `Register.jsx`.

---

## Key Concepts to Understand

| Concept | Where it appears |
|---|---|
| Server-Sent Events (SSE) | `notificationService.js` — `readSseStream()` |
| `fetch` + `ReadableStream` | `connectSse()` — why not `EventSource` |
| `AbortController` | `stopPolling()` — graceful disconnect on logout |
| Exponential / fixed reconnect | `scheduleReconnect()` — 5s fixed delay |
| HTTP 429 + `Retry-After` | `api.js` case 429 |
| `CustomEvent` on `window` | Cross-boundary communication (api → React) |
| Public API stability | `startPolling` / `stopPolling` names kept for `AuthContext` |
