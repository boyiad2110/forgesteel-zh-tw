# ANCESTRY-E1：族裔編輯器與經典表單標題

## 狀態

8 筆新 UI 已由 Marc 於 2026-10-19 核准並人工驗收通過，已接入雙來源快照及網站顯示。尚未合併、未部署。

雙來源核准目錄：Glossary 345、Names 131、Strings 1192、UI 276、Adaptations 423、Adaptation Sources 430。1pt、2pt 依核准保留英文。

## 本批範圍

- 新增譯文：`Ancestry Traits and Perks` →「族裔特性與專長」、`Signature Traits` →「招牌特性」、`Cost` →「費用」、`Move Up`／`Move Down` →「上移」／「下移」、`Preview` →「預覽」、`Cherry Pick` →「挑選特性」、`Import` →「匯入」。
- 重用既有核准譯文：Ancestry、Ancestry Points、Culture、Purchased Traits、Signature、Unnamed Feature。
- 套用至族裔編輯器分頁與欄位、排序按鈕提示、挑選與匯入介面，以及 Classic View 標題。
- 不改選項排序、費用數值、族裔資料或存檔格式；`1pt` 與 `2pt` 維持原文。

## 驗證

Node 24.18.0：語系守門、TypeScript 與正式建置通過；lint 0 錯誤、78 個既有警告。族裔編輯器與 Classic 標題檔案的 ESLint 定向檢查無警告。Vitest 55 檔／1075 項通過（使用工作區暫存目錄執行）。預設暫存路徑下全套 Vitest 遇到 Windows SSR 快取 `ENOENT`；改用工作區暫存目錄後全數通過。`npm audit` 因連線 `registry.npmjs.org` 遇 DNS `ENOTFOUND` 未完成。

## 人工驗收位置

1. 開啟角色建立／編輯的族裔編輯器，查看「招牌特性」與「自購特性」分頁；預覽側欄應有「預覽」與「挑選特性」。
2. 在自購特性裡查看欄位標題「費用」；挑選特性時 Signature 應顯示「招牌特性」，點數選項仍顯示 `1pt`、`2pt`，可匯入項目按鈕顯示「匯入」。
3. 使用特性排序按鈕時，提示分別顯示「上移」與「下移」。
4. 開啟角色的 Classic View，查看「族裔特性與專長」標題。

請回覆「通過」或指出畫面位置與未符合文字。驗收與合併狀態只在實際發生後回寫。
