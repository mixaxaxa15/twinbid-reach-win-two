
## 1. Вкладка «Обзор» — переименования

`src/pages/DashboardOverview.tsx`:
- Заголовок таблицы: `t("campaigns.title")` → новый ключ `t("overview.activeCampaignsTitle")` («Активные кампании» / «Active campaigns» / «Campañas activas»).
- Подписи 3 виджетов над таблицей: заменить на новые ключи `overview.activeImpressions`, `overview.activeClicks`, `overview.activeCtr` со значениями:
  - RU: «Показы по активным кампаниям», «Клики по активным кампаниям», «CTR по активным кампаниям»
  - EN: «Impressions on active campaigns», «Clicks on active campaigns», «CTR of active campaigns»
  - ES: «Impresiones de campañas activas», «Clics de campañas activas», «CTR de campañas activas»

Добавить эти ключи в `src/contexts/LanguageContext.tsx` (EN + RU) и `src/lib/translations-es.ts` (ES).

## 2. Статистика — не прыгать наверх при смене группировки

Проблема: в `src/pages/DashboardStatistics.tsx` при смене `groupBy` выполняются:
- `setPageSize(50)` (эффект на 207 строке),
- `setData([])` синхронно внутри загрузчика (215),

Из-за этого таблица мгновенно исчезает, страница укорачивается и браузер визуально сдвигается к виджетам.

Правки в `src/pages/DashboardStatistics.tsx`:
- Убрать синхронный `setData([])` при смене группировки. Вместо этого держать старые строки до прихода новых, а «placeholder» показывать только через `slowLoading` (уже есть).
- Перед сменой `appliedGroupBy` фиксировать `window.scrollY`, после применения новых данных (в `useLayoutEffect`, зависящем от `data`) восстанавливать сохранённое значение через `window.scrollTo({ top: savedY })`. Сохранение — в обработчике клика по кнопке группировки (передать сохранение как callback перед `setGroupBy`).
- Аналогично для смены `pageSize` (сброс на 50 при новой группировке не должен «прыгать» — уже покрывается фиксом scroll).

## 3. Человекочитаемые ошибки на языке интерфейса

Симптом (скриншот): всплывает «balance.toast.submitError: promocode already used by this user» — показан ключ + сырое серверное сообщение.

### 3.1. Хелпер перевода серверных ошибок

Новый файл `src/lib/serverErrors.ts`:
- Экспортирует `translateServerError(rawMessage: string, t: (k: string) => string): string`.
- Держит массив правил `{ match: RegExp | string, key: string }`, например:
  - `promocode already used by this user` → `errors.promoAlreadyUsed`
  - `promocode not found` → `errors.promoNotFound`
  - `insufficient funds` → `errors.insufficientFunds`
  - `unauthorized` / `401` → `errors.unauthorized`
  - fallback → `errors.generic` («Произошла ошибка, попробуйте позже»).
- Никогда не возвращает исходный английский технический текст.

### 3.2. Ключи переводов

Добавить в `LanguageContext.tsx` (EN/RU) и `translations-es.ts` (ES) блок `errors.*`:
- `errors.promoAlreadyUsed`: «Этот промокод уже был использован» / «You already used this promo code» / «Ya usaste este código promocional».
- `errors.promoNotFound`: «Промокод не найден».
- `errors.insufficientFunds`: «Недостаточно средств».
- `errors.unauthorized`: «Сессия истекла, войдите заново».
- `errors.generic`: «Не удалось выполнить операцию. Попробуйте позже».

Также заменить существующий `balance.toast.submitError` на короткий префикс без двоеточия («Ошибка пополнения»).

### 3.3. Точки применения

- `src/lib/apiStatus.ts` → `notifyError`: пропускать `extractMessage(e)` через `translateServerError`. Требуется передать `t` — либо через глобальный реестр (инициализируется в `App.tsx` эффектом от `useLanguage`, кладёт `t` в модульную переменную), либо экспортировать `setErrorTranslator(fn)` и вызывать из провайдера языка. Выбираем второй вариант: `apiStatus.ts` экспортирует `setErrorTranslator`, `LanguageContext` при монтировании / смене языка вызывает его, передавая `(raw) => translateServerError(raw, t)`.
- `src/pages/DashboardBalance.tsx`, `src/components/PendingPaymentDialog.tsx`: заменить прямые `toast.error(\`${prefix}: ${e?.message}\`)` на `notifyError(prefix, e)` из `apiStatus.ts`, чтобы использовать единый перевод.
- Проверить остальные места (`rg "toast.error" src`) — привести к `notifyError`, но только там, где показывается серверная ошибка (клиентские валидации типа «промокод неверный» оставить как есть).

## Технические заметки

- Ключ `balance.toast.submitError` остаётся как префикс тоста; сам текст ошибки поступает из `translateServerError`, поэтому пользователь видит вид «Ошибка пополнения: Этот промокод уже был использован».
- В `apiStatus.ts` сохранение обратной совместимости: если переводчик не установлен, используется прежнее поведение (сырое сообщение) — гарантирует, что тесты и SSR не сломаются.
- Восстановление скролла статистики делаем через `useLayoutEffect(() => { if (pendingScrollRef.current != null) { window.scrollTo(0, pendingScrollRef.current); pendingScrollRef.current = null; } }, [data, appliedGroupBy])`.
