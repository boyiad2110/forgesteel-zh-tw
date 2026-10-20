# ANCESTRY-E3：族裔招式殘留英文

## 狀態

已接入核准的族裔招式 UI 與「強化戰場武庫」顯示，Marc 於 2026-10-20 指示納入 PR #81 收尾。尚未合併、未部署。雙來源快照目前為 UI 308、Adaptations 427、Adaptation Sources 434。

## 本批範圍

- 招式觸發條件：Draconian Guard、Glowing Eyes、Glamor of Terror、Keeper of Order、Reactive Tumble 及 Resist the Unnatural。
- 招式目標：1 個生物、帶有你符印的生物、1 個生物或物體、自身或 1 個盟友；`Self` 全域使用「自身」。
- 招式資料欄位與結果：Area、Strike、Burst、Cube within、區域目標，以及傷害／推動等級結果；Psionic Bolt、Concussive Slam、Detonate Sigil、The Wode Defends 的各級結果均依核准文字顯示。
- 腐朽免疫成長句型與強化戰場武庫的名稱、說明、招式檢定欄位。
- 僅在官方能力 ID、原文與預期值相符時套用；自訂或遭改寫的內容保留原文。數值仍沿用上游計算結果。

## 人工驗收位置

在角色建立／編輯頁選擇相應族裔，再查看族裔特性與招式卡：

1. 龍騎士 Draconian Guard、惡魔 Glowing Eyes、高等精靈 Glamor of Terror、Memonek Keeper of Order、波德人 Reactive Tumble、人類 Resist the Unnatural：確認觸發條件欄位顯示中文。
2. 幻林精靈 The Wode Defends、還魂屍 Detonate Sigil、時空獵手 Concussive Slam 與 Psionic Bolt、龍騎士 Draconic Pride：確認目標、射程／區域標籤及各級檢定結果顯示中文，數字與推動距離維持正確。
3. 查看波德人腐朽免疫等級成長句型，以及戰術家 Improved Field Arsenal 的名稱、說明和招式檢定調整欄位。

Marc 於 2026-10-20 指示將目前族裔進度納入 PR 並合併收尾；本批沿用此授權。

## 驗證

Node 24.18.0 的完整入口：語系守門、lint（0 錯誤／83 警告）、TypeScript 與正式建置通過。Vitest 全套受到 Windows 暫存目錄 SSR `ENOENT` 影響，無法完成；另有 8 項族裔經典表格測試及 7 項 UI 綁定測試通過。`npm audit` 因 `registry.npmjs.org` DNS `ENOTFOUND` 未完成；隔離驗證的 `npm ci` 遇到 npm `Exit handler never called!`。完整結果與限制見 [PROGRESS](PROGRESS.md)。
