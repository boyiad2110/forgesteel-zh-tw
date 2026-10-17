# KITS-DISPLAY：套裝顯示漏接

## 問題與結果

套裝名稱與招牌能力已有核准名稱對照，但部分畫面沒有接上既有顯示元件。Classic View 也直接輸出英文裝備 enum 和部分數據欄位。本批接入建角器已選套裝設定欄位、能力／特性來源標籤與依來源分組標題、Classic View 裝備值、數據欄位及招牌能力名稱／主要動作標籤。

只在顯示時使用既有對照，不改遊戲資料、計算、搜尋、存檔或分享碼。自訂／改名套裝與未知來源保留原文。Stormwight 不在標準套裝範圍。

## 範圍與來源

- 批次：`KITS-DISPLAY`；[PR #77](https://github.com/boyiad2110/forgesteel-zh-tw/pull/77)，目標 `develop`，等待 Marc 人工驗收。
- 盤點結果：21 個標準套裝名稱、21 個描述、19 個招牌能力名稱都有既有 mapping。套裝名稱漏接集中在 ConfigKit 欄位及英雄能力／特性來源標籤；套裝圖書館、建角摘要與列印頁已透過 `ElementScope`／`PlayerName` 接線。
- 重用已核准的 Book Master Names／Glossary 和 Forge Steel UI 對照，本批未新增翻譯列或修改 Master Sheet。
- Classic View 裝備值重用 12 個 Book Master Glossary enum mapping；Speed、Disengage、Stamina、Stability、Melee／Ranged Distance、Kit 及 Main Action 重用既有核准對照。
- Classic View 下列複合標題目前沒有完全相符的 APPROVED Forge Steel UI／Adaptation，仍保留英文：`Equipment and Modifiers`、`Weapon / Implement`、`Armor / Ward`、`Melee Damage Bonus`、`Ranged Damage Bonus`、`Effects`。後續須先預覽並核准，不能直接新增自行撰寫的譯文。

## 驗證

- `src/l10n/kit-text.test.tsx`：7/7 通過，涵蓋 21 個標準套裝 mapping、自訂名稱回退、ConfigKit 欄位、能力來源標籤、Classic View 裝備值／數據／招式標題。
- `node scripts/l10n/verify.mjs`：語系守門、lint（0 errors；39 個 import 排序 warnings）、TypeScript、正式建置通過。
- 完整 Vitest 有 48 個 suites 因 Windows Vite SSR 暫存 `ENOENT` 無法載入；套裝專用測試通過。
- `npm audit` 因連線 `registry.npmjs.org` 遇 DNS `ENOTFOUND` 未完成。
- PR head `67c5a87e` 的 GitHub Localization CI #273 全通過：語系守門、lint、TypeScript、Vitest、正式建置、依賴稽核及玩家旅程瀏覽器回歸。不部署。

## 人工驗收位置與限制

在正體中文模式檢查：

1. 建角器已選套裝的設定框標題，例如「魔弓」；確認描述仍顯示正體中文。
2. 開啟能力卡、特性清單的來源標籤，切換緊湊／完整檢視；確認右側套裝來源名稱為中文。依來源分組時，分組標題也應顯示中文。
3. Classic View 選擇包含武器、護甲及數據加值的套裝；確認套裝名稱、裝備值、速度、撤離、體力、穩度、近戰／遠程射程與招牌能力名稱／主要動作標籤顯示中文，數值維持不變。
4. 確認上述未核准複合標題仍為英文；切換 English，確認已接入項目回到原英文。
5. 使用改名或自訂套裝，確認名稱及來源保留原值。

PR #77 的 GitHub CI 通過後再開始 Marc 人工驗收；驗收與合併結果以原 PR 為準。本批未合併、未部署。
