## Задача
Добавить в таблице результатов статистики выбор количества отображаемых строк: `50 / 100 / All`. По умолчанию — `50`. Селектор — справа сверху таблицы (в `CardHeader`, рядом с кнопками группировок).

## Правки в `src/pages/DashboardStatistics.tsx`

1. Локальный state:
   ```ts
   type PageSize = 50 | 100 | "all";
   const [pageSize, setPageSize] = useState<PageSize>(50);
   ```
2. Отображаемые строки:
   ```ts
   const visibleRows = pageSize === "all" ? sortedData : sortedData.slice(0, pageSize);
   ```
   В `<tbody>` заменить `sortedData.map` на `visibleRows.map`. Строка `Total` остаётся считаться из `totals` (сумма по всем данным, без пагинации) — не меняем.
3. CSV-выгрузка продолжает экспортировать `sortedData` целиком — не меняем.
4. UI в `CardHeader` (строка ~808): растянуть контейнер `justify-between`, слева — существующие кнопки группировок, справа — новый блок:
   ```tsx
   <div className="flex items-center gap-1">
     <span className="text-xs text-muted-foreground mr-1">{t("stats.rows")}</span>
     {([50, 100, "all"] as PageSize[]).map(sz => (
       <Button key={String(sz)} size="sm"
         variant={pageSize === sz ? "default" : "outline"}
         onClick={() => setPageSize(sz)}
         className={cn("min-w-[52px]", pageSize === sz ? "bg-primary text-primary-foreground" : "border-border")}>
         {sz === "all" ? t("stats.rowsAll") : sz}
       </Button>
     ))}
   </div>
   ```
5. Переводы в `src/contexts/LanguageContext.tsx` (или где лежат ключи `stats.*`):
   - `stats.rows`: EN `Rows`, RU `Строк`, ES `Filas`
   - `stats.rowsAll`: EN `All`, RU `Все`, ES `Todas`
6. При смене группировки (`appliedGroupBy` меняется) — сбрасывать пагинацию в дефолт `50`, чтобы `siteid` не наследовал `All`, случайно выбранный ранее:
   ```ts
   useEffect(() => { setPageSize(50); }, [appliedGroupBy]);
   ```

## Что не трогаем
- Логика запросов, backend, фильтры, сортировка, CSV.
- Стиль/токены — используем существующие shadcn Button-варианты.
