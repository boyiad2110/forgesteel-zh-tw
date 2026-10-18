# KITS-AUDIT-UI-01：套裝招式殘留 UI 補齊

## 問題與來源

完整檢查 21 個標準套裝招牌招式後，發現四個共用 UI 標籤仍顯示英文，另有能力詳情與 Compact 清單的射程數字投射問題。Stormwight 四個套裝不在已核准的書本內容範圍。

Forge Steel Localization Master 的「Forge Steel UI」分頁新增並核准四筆對照：

| UI ID | 網站原文 | 正體中文 |
|---|---|---|
| `ui.hero-builder.signature.f1a73e22` | Signature | 招牌 |
| `ui.hero-builder.signature-ability.5252b981` | Signature Ability | 招牌招式 |
| `ui.hero-builder.odds.e0382a01` | Odds | 機率 |
| `ui.hero-builder.roll-modifiers.2a3fad7d` | Roll Modifiers | 擲骰調整 |

四筆 UI 已納入雙來源快照與來源雜湊守門。顯示層沿用已核准來源文字，只投射網站傳入的射程數字；不改套裝資料或計算。

## 實作範圍

- 能力詳情與 Compact 能力清單的招牌標籤顯示「招牌」。
- Classic View 的標準套裝能力類型顯示「招牌招式」。
- 招式 Power Roll 的機率按鈕提示顯示「機率」。
- 能力詳情中的 Roll Modifiers 標題顯示「擲骰調整」。
- 能力詳情、Compact 與 Classic View 的射程中文沿用上游數字；英文模式、自訂能力與未知內容維持原有回退行為。
- Classic View「裝備與調整值」的標準套裝效果描述沿用既有核准翻譯。

## 驗證與交付

完整驗證、PR、CI 與合併狀態以 [PROGRESS](PROGRESS.md) 及本批 PR 為準。Marc 人工驗收前不合併、不部署。

## Marc 人工驗收

1. 使用一名具有標準套裝的英雄開啟招牌招式詳情，確認標籤為「招牌」；若該能力有額外擲骰調整，標題顯示「擲骰調整」。
2. 對有機率提示按鈕的招式查看按鈕提示，確認顯示「機率」；點擊後確認各階級機率仍正常顯示。
3. 開啟同一英雄的 Compact 能力清單，確認招牌標籤顯示「招牌」。
4. 切換 Classic View，確認標準套裝招牌能力類型顯示「招牌招式」；在「裝備與調整值」的效果區檢查爆裂箭矢與鞭影出膛等套裝效果描述已顯示中文，射程值與其他視圖及英文來源相符。
5. 切換 English 後確認這些標籤恢復英文，再切回正體中文確認譯文恢復；確認數值與自動計算結果不變。
