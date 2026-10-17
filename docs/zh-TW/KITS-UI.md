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

1. 開啟套裝圖書館的任一標準套裝，切到「數據」頁籤。
2. 開啟建角器中的已選套裝，切到套裝「數據」頁籤。
3. 確認適用欄位顯示「武器」、「近戰傷害」、「遠程傷害」、「近戰射程」、「遠程射程」、「撤離」，數值仍與英文版相同。
4. 切回英文，確認欄位回到 `Weapon`、`Melee Damage`、`Ranged Damage`、`Melee Distance`、`Ranged Distance`、`Disengage`。

不同套裝依資料可能沒有所有數據欄位；請用包含近戰與遠程傷害、射程及撤離值的套裝核對完整欄位。建角器摘要與圖書館詳情共用 `KitStats`。

## 結案

等待 Marc 人工驗收。驗收與合併結果僅在發生後補入原 PR 與 Master Sheet。
