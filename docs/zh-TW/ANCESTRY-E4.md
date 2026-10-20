# ANCESTRY-E4：族裔特性條件與招式殘留標籤

## 狀態

24 筆 Forge Steel UI 譯文已由 Marc 核准、寫入 Master Sheet，並接入雙來源快照與網站顯示；Marc 於 2026-10-20 指示納入 PR #81 收尾。尚未合併、未部署。

## 本批範圍

依 Forge Steel 網站原文核對，不以 Book Master 的同名族裔敘述代替網站來源。只在官方族裔能力與來源資料吻合時套用；自訂或改寫內容保留原值。核准內容包括：

- `When you can use all your arms in the attempt` → `當你能用所有手臂進行嘗試時`
- `Presence tests using Flirt, Persuade` → `使用魅惑或遊說進行的氣場考驗`
- `Hide, Sneak` → `隱匿、潛行`
- `Climb, Gymnastics, Swim` → `攀爬、體操、游泳`
- `Stamina +6 per echelon` → `體力每境界 +6`；`echelon` → `境界`
- `+1 SURGE PER ENCOUNTER` → `鬥志 +1 / 每場遭遇`
- 條件句與標籤：`When resisting environmental effects or a creature’s traits or abilities`、`When noticing threats`、`When recalling lore`、`When lifting and hauling heavy objects`、`When parsing schematics, maps, and other systematic documents that aren’t inherently chaotic`、`When interacting with undead creatures`、`You are targeted with a strike`、`Might tests`、`All tests`、`Reason, Intuition, Presence tests`、`MOVEMENT MODE`、強制移動 Push／Pull／Slide，以及 `Power Roll + Might or Presence`、`Power Roll + Might or Agility`、`Power Roll + Reason or Intuition or Presence`、`Start of combat`。

## 人工驗收位置

角色建立／編輯頁選擇對應族裔，查看特性、招式、傷害調整與能力檢定資訊：

1. 四臂族「四臂運動」確認觸發條件為「當你能用所有手臂進行嘗試時」，技能為「攀爬、體操、游泳」。
2. 高等精靈「高等精靈魅術」確認技能列為「使用魅惑或遊說進行的氣場考驗」；伍德精靈「幻林精靈魅術」確認技能列為「隱匿、潛行」。
3. 矮人「堅硬石膚」確認體力欄為「體力每境界 +6」；孟莫涅克「有益情緒」確認遭遇開始時的鬥志顯示「鬥志 +1 / 每場遭遇」。
4. 確認強制移動、招式檢定標題、檢定條件與反應觸發在官方族裔能力中使用核准中文；自訂改寫仍顯示原值。

## 驗證

驗證結果以本批完成後的 `node scripts/l10n/verify.mjs` 為準。Windows 暫存目錄 SSR `ENOENT` 或 npm registry DNS 錯誤會使 Vitest 全套或 audit 無法完成；定向 UI、族裔與目錄測試結果另列於 [PROGRESS](PROGRESS.md)。
