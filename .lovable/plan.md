## Что добавить

В создание/редактирование **баннерного** креатива добавить выбор типа контента и превью, только на фронте (без изменений API).

### 1. Переключатель типа креатива (только для формата `banner`)

В `CreativesEditor.tsx` — Tabs / SegmentedControl над полями:
- **Изображение** (текущее поведение: URL + макросы + загрузка картинки)
- **HTML-код**
- **iframe**

Тип хранится в поле `creativeType: "image" | "html" | "iframe"` в интерфейсе `Creative` (`CampaignContext.tsx`). Все новые поля — UI-only, в API не отправляются.

### 2. Поля для каждого типа

Общее для всех типов: **Название креатива** (как сейчас).

**Изображение (без изменений):**
- URL лендинга + макросы (`{click_id}` и т.д.) + загрузка/кроп картинки.

**HTML-код:**
- Только `<Textarea>` для HTML-кода (моно-шрифт, min 8 строк).
- Хинт: `Вставьте полный HTML-код баннера. Убедитесь, что размер контента совпадает с {w}×{h}px`.
- **URL лендинга и блок макросов НЕ показываются.**
- Поле `htmlCode: string`.

**iframe:**
- Только `<Input>` для URL iframe (валидация https).
- **URL лендинга и блок макросов НЕ показываются.**
- Поле `iframeUrl: string`.
- Жёлтый info-блок:
  > Клики внутри iframe не отслеживаются TwinBid и не будут отображаться в статистике кампании. Для настройки отслеживания через редиректы на нашу ссылку обратитесь к менеджеру.

### 3. Валидация размера (для html / iframe)

Рендерим контент во внеэкранном контейнере фиксированного размера баннера и измеряем реальный размер:

- **HTML**: `<iframe srcDoc={htmlCode} sandbox="allow-scripts">`; после `load` берём `contentDocument.documentElement.scrollWidth/scrollHeight`.
- **iframe**: пробуем то же; если cross-origin (нет доступа к DOM) — просим явное подтверждение чекбоксом «Мой iframe имеет размер {w}×{h}px» (иначе `sizeMismatch=true`).

Существующая блокировка «Далее» при `creatives.some(c => c.sizeMismatch)` уже сработает.

Валидация обязательности:
- `image`: как сейчас (`imageUrl` + `url`).
- `html`: `htmlCode` не пуст; `url` и `imageUrl` не проверяются.
- `iframe`: `iframeUrl` валидный https-URL; `url` и `imageUrl` не проверяются.

Кнопки «Обрезать» и AutoCropConfirmDialog доступны только для `image`.

### 4. Превью

В `CreativePreviewDialog.tsx` расширяем `BannerSlot`, чтобы принимать `creative` целиком:
- `image` → `<img>` (текущее).
- `html` → `<iframe srcDoc={htmlCode} sandbox="allow-scripts">` фиксированного размера баннера.
- `iframe` → `<iframe src={iframeUrl} sandbox="allow-scripts allow-same-origin">`.

Кнопка «Предпросмотр» доступна для всех трёх типов, когда соответствующее поле заполнено.

### 5. Переводы (EN/RU/ES)

`LanguageContext.tsx` и `translations-es.ts`:
- `create.creativeTypeImage/Html/Iframe`
- `create.htmlCode`, `create.htmlCodeHint`, `create.htmlCodeRequired`
- `create.iframeUrl`, `create.iframeUrlHint`, `create.iframeUrlInvalid`
- `create.iframeTrackingWarning` (полный текст про статистику и менеджера)
- `create.iframeSizeConfirm`
- `create.htmlSizeMismatch` / `create.iframeSizeMismatch`

### 6. Что НЕ меняется

- API-контракт, `CampaignContext` mapping в/из API (новые поля живут только в памяти UI).
- Форматы `push` / `native` / `popunder` — только `banner`.
- Существующая логика image cropper и требований к размеру картинки.

## Технические детали

**Файлы:**
- `src/contexts/CampaignContext.tsx` — расширить `Creative`: `creativeType?`, `htmlCode?`, `iframeUrl?`, `iframeSizeConfirmed?`.
- `src/components/dashboard/CreativesEditor.tsx` — Tabs типа, условный рендер (URL + макросы + картинка / textarea / iframe input), измерение размера через скрытый iframe, обновление `sizeMismatch`.
- `src/components/dashboard/CreativePreviewDialog.tsx` — расширить `BannerSlot` для html/iframe.
- `src/pages/CreateCampaign.tsx` и `src/pages/EditCampaign.tsx` — обновить `validate()`: ветвление по `creativeType`.
- `src/contexts/LanguageContext.tsx`, `src/lib/translations-es.ts` — переводы.

**Безопасность:** iframe всегда с `sandbox`; для user-HTML — без `allow-same-origin` в превью (только для измерения размера временный `allow-same-origin`). Никакого `dangerouslySetInnerHTML`.
