# ANCESTRY-E5：族裔截圖回歸修正

## 範圍

依 Marc 提供的重複截圖修正共用顯示路徑，重用既有 APPROVED 詞彙與 UI 譯文，不新增或改寫譯文，也不修改遊戲資料或計算：

- 龍騎士「龍鱗護衛」的傷害調整選項標題顯示「傷害調整」。
- 惡魔「巧舌如簧」的 Interpersonal Skill 標題與說明顯示核准中文。
- Roll Modifier 的 Edge 使用 Book Master「優勢」；Stability、Disengage、Recoveries 欄位使用已核准詞彙。
- 矮人「堅硬石膚」的體力欄保留標籤／數值分欄格式，沿用 Field 粗體標籤樣式。
- 伍德精靈、復仇者與時光掠奪者招式的動態結果，只將上游已計算的傷害、推動／滑動距離與威力門檻投射到對應核准中文；不匹配的改寫仍保留完整英文。

## 驗收位置

以官方族裔來源查看上述特性與招式；招式詳情開啟自動計算，確認各級結果不殘留英文，數字與威力門檻由上游結果提供。截圖中的格式也以原始 Markdown／Field 標籤呈現。

## 驗收狀態

Marc 已於 2026-10-20 回覆「通過」。E5 尚待整理進交付 PR；未合併、未部署。

## 驗證

驗證結果與環境限制記錄於 [PROGRESS](PROGRESS.md)。本批定向 DOM 回歸 2 suites／13 tests 通過；完整 Vitest 有 50 suites 因 Windows 暫存 SSR `ENOENT` 未能載入（5 suites／69 tests 通過），audit 因 registry DNS `ENOTFOUND` 未完成，隔離驗證的 `npm ci` 遇 npm `Exit handler never called!`。人工驗收已通過，但完整驗證未全數通過，交付前仍須處理環境限制。
