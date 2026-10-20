# ANCESTRY-C：族裔詳情 UI

## 狀態

新譯文已由 Marc 於 2026-10-19 核准；Marc 同日人工驗收通過。未合併、未部署。

Forge Steel Master 修改時間：2026-10-19T04:45:18.623Z；書本 Master 修改時間：2026-10-17T02:36:52.060Z。雙來源核准目錄：Glossary 345、Names 131、Strings 1192、UI 263、Adaptations 423、Adaptation Sources 430。

## 本批範圍

- 新增核准 UI：`Purchased` →「自購」、`Ancestry Points` →「族裔點數」。
- 族裔詳情面板接入既有核准分頁：「Overview」→「總覽」、「Signature」→「招牌」、「Culture」→「文化」。
- 列印頁接入「Purchased Traits」→「自購特性」與「Ancestry Points」→「族裔點數」；後者也接入族裔詳情面板。
- 不改族裔點數計算、遊戲資料或列印內容；自訂資料仍依既有回退規則處理。

## 驗證

完整驗證的語系守門、lint（0 錯誤／78 警告）、TypeScript、Vitest（55 檔／1075 項）及正式建置通過。`npm audit` 因連線 `registry.npmjs.org` 遇到 DNS `ENOTFOUND` 未完成，不列為通過。

## 人工驗收位置

1. 開啟任一角色的族裔詳情面板，上方分頁應顯示「總覽」、「招牌」、「自購」；有文化的族裔也應顯示「文化」。
2. 切到「自購」，欄位標題應顯示「族裔點數」，點數數字應與原英文版相同。
3. 開啟該族裔的列印頁，點數欄位應顯示「族裔點數」，數字不變；自購特性標題應顯示「自購特性」。
4. 切換英文確認仍顯示原文 `Purchased`／`Ancestry Points`。

請回覆「通過」或指出畫面位置與未符合文字。驗收與合併狀態只在實際發生後回寫。
