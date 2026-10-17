# KITS-ABILITIES-01：標準套裝招牌招式

交付：[draft PR #79](https://github.com/boyiad2110/forgesteel-zh-tw/pull/79)。目前等待 Marc 人工驗收，不合併、不部署。

## 範圍與來源

- 覆蓋 21 個標準套裝的招牌招式；Stormwight 不在 Book Master 核准範圍。
- 重用 Book Master 已核准的招式名稱與文字；`Let's Dance`、`Raider’s Awe` 使用已核准名稱「共舞吧」、「突擊威勢」，並記錄網站名稱差異適配。
- Forge Steel Master 新增 36 筆 Adaptations 與 36 筆來源關聯：21 個招式描述、13 個文字效果與 2 個名稱差異。招式 Power Roll 保持原樣。
- Mountain 與 Sniper 效果使用核准的 Calculation Display Note。顯示層只投射上游計算出的數值，不改能力資料或計算邏輯。

## 實作與驗證

- 能力面板與 Classic View 卡片都接入標準套裝招式名稱、短描述及 13 個文字效果。Classic View 也顯示在地化的「效果」標籤。
- Mountain／Sniper 會依英雄目前力量或敏捷，把上游自動計算結果顯示在中文句子中；切換中英文不改動英雄或能力資料。共用數值投射器現在依核准模板處理中英文與數字的空白，避免護甲值句子多出空白，也保留套裝額外傷害句所需的空格。
- 最新程式版本 `da8d7ae2` 的 GitHub Localization CI #282（run `39057185386`）全數通過：語系守門、lint、TypeScript、完整 Vitest、正式建置、dependency audit 與玩家旅程瀏覽器回歸。本機 `node scripts/l10n/verify.mjs` 的 guard、lint、TypeScript 與正式建置通過；Windows sandbox 的 Vitest 遇 SSR 暫存檔 `ENOENT`，`npm audit` 因 registry DNS `ENOTFOUND` 無法完成，本機完整驗證未全數通過。
- 不截圖、不錄影；尚未人工驗收，不合併、不部署。

## Marc 人工驗收清單

1. 開啟任一標準套裝的招牌招式詳情，確認名稱與短描述是正體中文；挑選「共舞吧」或「突擊威勢」核對名稱。
2. 確認招式效果是中文，Power Roll 的階級與傷害仍正常顯示；Classic View 卡片亦顯示中文效果與「效果」標籤。
3. 用 Mountain 或 Sniper 英雄招式測試自動計算：力量 3／敏捷 2 時，中文效果應顯示「額外造成 3 的傷害」；改成力量 1／敏捷 4 後應顯示「額外造成 4 的傷害」。確認 Classic View 與能力面板都會更新。
4. 切換成 English，確認恢復上游英文與數值；再切回正體中文，確認翻譯恢復。若角色有自訂／改名招式，確認自訂文字仍保留。

人工驗收後，請在 [PR #79](https://github.com/boyiad2110/forgesteel-zh-tw/pull/79) 回覆結果；目前工作分支為 `codex/kits-abilities-01`。
