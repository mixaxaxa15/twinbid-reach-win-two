
## Что делаем

Добавляем встроенный редактор изображений в `CreativesEditor`. Пользователь загружает картинку любого размера. Если она не совпадает с требуемым размером — показываем предупреждение и кнопку «Редактировать» с открытием модалки-кропера. Сохранить кампанию с «неправильной» картинкой всё же можно, но перед сабмитом появится подтверждающий диалог. Также ужесточаем лимит размера файла до 1 МБ.

## Требуемые размеры по формату

| Формат | Целевой размер | Поведение рамки в кропере |
|---|---|---|
| `banner` | ровно `WxH` из `bannerSize` (300×100 / 300×250 / 300×600 / 728×90) | фиксированная, только позиционируется |
| `native` | квадрат `NxN`, N ≥ 200px | квадратная рамка, drag + resize (1:1) |
| `push` (in-page push, он же ipp) | ровно 192×192 | фиксированная 192×192 |
| `popunder` | — | картинка не нужна |

## Лимит размера файла

- Уменьшить `MAX_IMAGE_BYTES` в `CreativesEditor.tsx` с 5 МБ до **1 МБ** (`1 * 1024 * 1024`).
- Проверка применяется:
  - при загрузке исходного файла (`handleImageUpload`),
  - после кропа — результирующий PNG тоже проверяется на ≤1 МБ; если превышен, пробуем экспортировать в JPEG q=0.9, если и это > 1 МБ — показываем toast «Итоговое изображение больше 1 МБ, уменьшите область/зум».
- Обновить перевод `create.imageSizeError` на «Размер файла не должен превышать 1 МБ» (RU/EN/ES) и `create.imageFormatHint` — «PNG, JPG или GIF, до 1 МБ».

## UX-поток

### Загрузка
1. Пользователь жмёт «Загрузить изображение», выбирает файл.
2. Валидация: формат (PNG/JPG/GIF) и размер ≤ 1 МБ. При провале — toast, поле не заполняется.
3. Файл читается в `dataURL`, определяются natural width/height.
4. `imageUrl` / `pendingFile` / `imageFileName` проставляются всегда — картинка считается загруженной, даже если размеры не совпадают.
5. Если размеры не совпадают с целевыми — на креативе выставляется флаг `sizeMismatch = true` и:
   - под превью показывается жёлтый warning «Размер не соответствует требуемому (нужно W×H). Рекомендуем отредактировать»,
   - появляется кнопка **«Редактировать»** рядом с «Загрузить изображение».
6. GIF: `<canvas>` теряет анимацию, поэтому кропер не открываем. Warning остаётся, кнопки «Редактировать» нет; подсказка «GIF должен быть точно W×H пикселей».

### Редактирование
7. По клику «Редактировать» открывается модалка-кропер (новый `ImageCropperDialog`):
   - показывает исходную картинку в контейнере фикс. высоты,
   - оверлей-рамка требуемых пропорций,
   - слайдер **зум** (0.25×…4×) + кнопки +/−,
   - drag картинки,
   - для native — рамка растягивается за угол с сохранением 1:1,
   - кнопки **Отмена / Сохранить**.
8. При «Сохранить» в кропере:
   - через `<canvas>` вырезается область в целевой размер (banner: W×H, push: 192×192, native: сторона рамки в исходных px, min 200),
   - экспорт в `image/png`; если > 1 МБ — фолбэк в `image/jpeg` q=0.9; если всё ещё > 1 МБ — toast и не закрываем модалку,
   - в креатив пишется `imageUrl` / `pendingFile` / `imageFileName = <original>-cropped.png|jpg`, `sizeMismatch = false`.
9. Исходник храним в локальном state `originalSources[creativeId] = { dataUrl, file, natural }` для повторного открытия кропера.

### Сабмит кампании
10. В `CreateCampaign.tsx` / `EditCampaign.tsx` перед реальным сабмитом:
    - если среди `creatives` есть хотя бы один с `sizeMismatch === true` — открываем `AlertDialog` (shadcn):
      - текст: «У некоторых креативов размер картинки не соответствует требуемому. Сохранить как есть или отредактировать?»,
      - кнопки: **«Отредактировать»** (закрыть диалог, оставить форму) и **«Сохранить как есть»** (продолжить исходный сабмит),
    - если mismatch нет — сабмит идёт как сейчас.

## Технические детали

### Тип `Creative`
- В `src/contexts/CampaignContext.tsx` в тип `Creative` добавить `sizeMismatch?: boolean` (UI-only, в API не уходит).

### Новый файл
- `src/components/dashboard/ImageCropperDialog.tsx` — shadcn `Dialog`, без сторонних либ:
  - props: `open`, `source: { dataUrl, naturalWidth, naturalHeight }`, `target: { w, h, mode: "fixed" | "square-resizable" }`, `onSave(file, dataUrl)`, `onClose()`,
  - state: `scale`, `offset {x,y}`, `cropSize` (native),
  - pointer-обработчики drag картинки и drag/resize рамки,
  - «Сохранить» рисует source-crop-rect в canvas целевого размера, экспорт PNG → fallback JPEG, вызывает `onSave`.

### `CreativesEditor.tsx`
- `MAX_IMAGE_BYTES = 1 * 1024 * 1024`.
- Новый prop `bannerSize?: string`.
- `getTargetDims(formatKey, bannerSize) → { w, h, mode } | null`
  - `banner` → fixed W×H, `push` → fixed 192×192, `native` → square-resizable (min 200), `popunder` → null.
- В `handleImageUpload` считать natural размеры, всегда проставлять картинку + флаг `sizeMismatch`, сохранять исходник в `originalSources`.
- Локальный state `cropperState: { creativeId } | null`; рендерим один `ImageCropperDialog`.
- Кнопка «Редактировать» + warning под превью при `sizeMismatch`.

### `CreateCampaign.tsx` / `EditCampaign.tsx`
- Пробросить `bannerSize` в `<CreativesEditor bannerSize={bannerSize} ... />`.
- Ввести state `confirmMismatchOpen` + `AlertDialog` с двумя кнопками; вызывать из `handleSubmit` при наличии `sizeMismatch`, иначе выполнять текущий сабмит.

### Переводы (RU/EN/ES) — `LanguageContext.tsx` + `translations-es.ts`
- Обновить: `create.imageSizeError` («до 1 МБ»), `create.imageFormatHint` («PNG, JPG или GIF, до 1 МБ»).
- Новые:
  - `create.imageWrongSize` — «Размер не соответствует требуемому ({w}×{h}). Рекомендуем отредактировать.»
  - `create.editImage` — «Редактировать»
  - `create.cropTitle` — «Редактор изображения»
  - `create.cropSave` / `create.cropCancel`
  - `create.cropZoom` — «Масштаб»
  - `create.cropHintFixed` — «Перетащите картинку под рамку»
  - `create.cropHintSquare` — «Перетащите картинку и растяните рамку»
  - `create.cropTooLarge` — «Итоговое изображение больше 1 МБ, уменьшите область/зум»
  - `create.gifExactSize` — «GIF должен быть точно {w}×{h} пикселей»
  - `create.mismatchConfirmTitle` — «Размер картинки не соответствует»
  - `create.mismatchConfirmBody` — «У некоторых креативов размер картинки не совпадает с требуемым. Сохранить как есть или отредактировать?»
  - `create.mismatchSaveAnyway` — «Сохранить как есть»
  - `create.mismatchGoEdit` — «Отредактировать»

## Что НЕ трогаем
- Бэкенд, схему БД, аплоад-эндпоинт — уходит обычный `File`.
- Popunder.
- Прочие валидации и поля формы кампании.
