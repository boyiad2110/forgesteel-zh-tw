# KITS-UI：套裝數據欄位

## 問題與結果

標準套裝的數據欄位仍顯示英文。KITS-UI 將五個已核准的 Forge Steel UI 標籤接到共用 `KitStats`，並重用 Book Master 已核准的「Disengage＝撤離」。同一元件用於套裝詳情與建角器已選套裝的 Stats 頁籤；不改套裝資料或數值計算。

## 範圍與來源

- 批次：KITS-UI。
- Forge Steel Localization Master：「Forge Steel UI」五筆已核准標籤：`Weapon`、`Melee Damage`、`Ranged Damage`、`Melee Distance`、`Ranged Distance`。
- Draw Steel Book Master Glossary：沿用已核准 `Disengage＝撤離`，不新增 Glossary 列。
- UI 中文：武器、近戰傷害、遠程傷害、近戰射程、遠程射程；`Disengage` 顯示「撤離」。
- 雙來源快照列數：Glossary 345、Names 131、Strings 1192、UI 240。Forge Sheet 修改時間 `2026-10-17T03:13:17.369Z`；Book Sheet 修改時間 `2026-10-17T02:36:52.060Z`。

## 驗證

2026-10-17 本機最終版本 `node scripts/l10n/verify.mjs`：語系守門通過、lint 0 errors（33 個 import 排序 warnings）、TypeScript 通過、正式建置通過。完整 Vitest 受到 Windows 暫存 SSR `ENOENT` 影響，49 個 suites 無法載入；套裝單檔回歸 `src/l10n/kit-text.test.tsx` 通過 6/6。`npm audit` 因連線 `registry.npmjs.org` 遇 DNS `ENOTFOUND` 未完成。先前 `verify-isolated.mjs` 的乾淨安裝也遇到 npm `Exit handler never called!`，環境未變更，因此未重跑安裝。未完成項目將由 PR CI 補驗。

雙來源快照 dry-run 確認只變更 UI 快照、整合 UI 數為 240，再以同一份核准擷取套用。

## 驗收位置與限制

請人工檢查：

1. 在套裝圖書館開啟「突擊」（Raider），切到「數據」頁籤；確認「武器」、「近戰傷害」、「遠程傷害」、「遠程射程」、「撤離」為中文，數值不變。
2. 開啟「長兵」（Guisarmier），確認「近戰射程」為中文，數值不變。
3. 在建角器中將「突擊」與「長兵」加入已選套裝，分別開啟套裝詳情的「數據」頁籤，確認相同標籤也顯示中文。
4. 切回英文，確認欄位回到 `Weapon`、`Melee Damage`、`Ranged Damage`、`Melee Distance`、`Ranged Distance`、`Disengage`。

不同套裝依資料只顯示有值的欄位，因此「突擊」與「長兵」合併覆蓋本批所有標籤。建角器已選套裝詳情與圖書館詳情共用 `KitStats`。

## 結案

Marc 已於 2026-10-17 人工驗收通過；[PR #76](https://github.com/boyiad2110/forgesteel-zh-tw/pull/76) 已 squash 合併至 develop `3067540057b3d47ec0c012100ff340d49402d64b`。GitHub Localization CI #270 全綠，含語系守門、lint、TypeScript、Vitest、正式建置、audit 與玩家旅程瀏覽器回歸；本機完整 Vitest／audit 限制見上文。本批未部署。
