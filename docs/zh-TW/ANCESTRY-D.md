# ANCESTRY-D：昔日人生特性編輯器 UI

## 狀態

5 筆 UI 已由 Marc 於 2026-10-19 核准並人工驗收，已接入雙來源快照及網站顯示；完整驗證除 `npm audit` 外通過。未合併、未部署。

Forge Steel Master 修改時間：2026-10-19T05:03:09.063Z；書本 Master 修改時間：2026-10-17T02:36:52.060Z。雙來源核准目錄：Glossary 345、Names 131、Strings 1192、UI 268、Adaptations 423、Adaptation Sources 430。

## 本批範圍

- `Ancestry Feature` →「族裔特性」：自訂角色的 Game Content 新增選單。
- `Source` →「來源」、`Current ancestry` →「現有族裔」、`Former ancestry` →「昔日族裔」、`Value` →「點數」：族裔特性選擇器的編輯欄位。
- 僅套用核准 UI；不更動來源切換、族裔特性選項、點數數值或角色資料。

## 驗證

Node 24.18.0 執行 `node scripts/l10n/verify.mjs`：語系守門、lint（0 錯誤／78 警告）、TypeScript、Vitest（55 檔／1075 項）及正式建置通過。`npm audit` 因連線 `registry.npmjs.org` 遇到 DNS `ENOTFOUND` 未完成。工作樹的 CRLF 文件差異使用 `git -c core.whitespace=cr-at-eol diff --check` 核對。

## 人工驗收位置

1. 開啟角色編輯器的「自訂」功能，進入 Game Content 新增選單；`Ancestry Feature` 應顯示「族裔特性」。
2. 編輯一個族裔特性選擇器，檢查欄位標題「來源」、「點數」，以及勾選項「現有族裔」、「昔日族裔」。
3. 切換英文確認原文分別為 `Ancestry Feature`、`Source`、`Current ancestry`、`Former ancestry`、`Value`；切換來源與點數時，選項與數值操作仍正常。

請回覆「通過」或指出畫面位置與未符合文字。驗收與合併狀態只在實際發生後回寫。
