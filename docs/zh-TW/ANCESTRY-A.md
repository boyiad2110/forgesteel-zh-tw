# 族裔缺漏 A 批

## 狀態

17 個 APPROVED 網站適配已接入雙來源快照；16 個靜態網站用途接入 mapping，程式驗證完成後交 Marc 人工驗收。A04、A07 沿用 Book Master 譯文；A12、A17 採 Marc 指定文字；其餘沿用本批核准內容。文化、生涯、專長與族裔其他未核准段落不在本批。

工作分支：`codex/ancestry-approved-display-fixes`。

## 實作範圍

- 17 筆族裔網站適配已核准：9 段族裔特性／招牌招式描述，以及 8 段招式效果；其中 16 個靜態用途已接入 mapping。
- 龍人守衛的 1 段核准效果受上游等級計算改寫；沒有核准計算句型綁定前不接 mapping，避免將含實際數值的英文錯配成靜態中文。
- 雙來源快照新增 17 筆 Adaptations、18 筆來源關聯；同一本書本字串供多個網站用途時，分別保留用途 ID。
- `Adaptation Sources` 的全空白分隔列不再被誤判為來源孤兒列；含任何資料的孤兒列仍會使擷取失敗。
- Classic 特性與招式卡採用各自用途的核准文字。來源吻合、具核准 mapping 時才顯示中文。

## 人工驗收位置

1. 開啟任一官方角色的「特性」分頁，檢查本批涉及的族裔特性描述與招式短描述。
2. 開啟角色的 Classic View，在 **Ancestry Traits and Perks** 檢查族裔特性及招式效果；本批其他靜態段落應顯示中文。
3. 切換回英文確認仍顯示英文原文；自訂或改名特性仍保留原文。
4. 龍人守衛招式卡的減傷效果目前由上游改寫成含實際數值的句子，且沒有核准的計算綁定；該動態句保留英文是預期結果，不列為本批中文驗收通過項目。

請回覆「通過」或指出畫面位置與未符合的文字。人工驗收及合併結果只在實際發生後回寫本批 PR 與 Sheet。

## 自動檢查

- `scripts/l10n/dual-sheet.test.mjs` 保護空白分隔列與非空孤兒列的擷取行為。
- `src/l10n/ancestry-classic.test.tsx` 遞迴檢查 12 個內建族裔的 Classic 特性、名稱、靜態描述及已映射招式效果；龍人守衛的未綁定動態文字另檢查保留英文。
- Node v24.18.0：語系守門、TypeScript、lint（0 錯誤，71 警告）、正式建置均通過；Vitest 使用 `--pool=threads --maxWorkers=4`，55 個測試檔、1071 項通過。
- 隔離驗證受環境限制：乾淨副本 `npm ci` 以 `Exit handler never called` 失敗；npm audit 無法連到 `registry.npmjs.org`；Playwright Edge 啟動時遇 Windows sandbox 權限錯誤，因此瀏覽器自動回歸未完成。手動網站驗收仍待 Marc。
- PR 與程式版本、人工驗收結果及後續狀態記在 [PROGRESS](PROGRESS.md)。
