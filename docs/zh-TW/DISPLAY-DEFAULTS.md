# DISPLAY-DEFAULTS：預設描述盤點與譯文預覽前置資料

2026-10-20，基底 `develop` `4ec5c5d6`。本文件只記官方候選資料、英文來源及待核准範圍；沒有新增譯文，也不把候選數當成畫面漏譯數或完成率。

## 來源與觸發條件

`FeatureConfigPanel.getDescription()` 在特性的 `description` 為空時，使用 `FeatureLogic.getFeatureTypeDescription(type)` 的程式預設英文。建角頁的族裔、生涯、職業、糾葛選項會呼叫 `FeatureConfigPanel`。以下數量是對 Core、Orden、Patreon、The Beastheart、The Summoner 官方來源書的這四組內容遞迴盤點所得；同一父項內依物件去重，跨父項仍可能重複。它們是待查候選，尚非實際 DOM 證據。

| 類型 | 官方空描述候選 | 來源群／代表 ID | 程式預設英文 | 目前核准狀態 |
|---|---:|---|---|---|
| AncestryFeatureChoice | 2 | 族裔；`revenant-feature-4-1` | This feature allows you to select a feature from an ancestry. | 無此預設句的精確核准來源 |
| Perk | 73 | 生涯 18：`career-artisan-feature-4`；職業 55：`censor-2-1` | This feature allows you to choose a perk. | 生涯 18 個符合既有單選保護條件，已沿用 APPROVED UI；職業 55 個不在該適用範圍，須核准擴用與逐項保護 |
| Domain | 2 | 職業；`censor-1-2` | This feature allows you to choose a domain. | 無精確核准來源 |
| Kit | 6 | 職業；`censor-1-5` | This feature allows you to choose a kit. | 無精確核准來源 |
| ClassAbility | 66 | 職業；`censor-1-8` | This feature allows you to choose an ability from your class. | 無精確核准來源 |
| SummonChoice | 16 | 職業；`summoner-1-1-4` | This feature allows you to choose monsters you can summon. | 無精確核准來源 |
| ItemChoice | 2 | 糾葛；`comp-artifactBonded-ba` | This feature allows you to choose an item. | 無精確核准來源 |
| Retainer | 1 | 糾葛；`comp-meddlingButler-b` | This feature grants you a retainer. | 無精確核准來源 |
| Toggle | 1 | 糾葛；`comp-shatteredLegacy-b` | This feature allows you to turn a feature on or off. | 無精確核准來源 |

四組候選合計 169 個，其中族裔 2、生涯 18、職業 145、糾葛 4。生涯 18 個 Perk 的 `count` 都是 1、`lists` 都只有一項，符合現有 `isSingleCareerPerk` 條件；職業 Perk 的 `count` 也都是 1，但不可直接推用生涯的核准範圍。職業 Domain 有 1 選及 2 選，ClassAbility 有 1 選及 2 選，SummonChoice 也有 1 選及 2 選；預設英文未隨數量變化，中文預覽不可擅自固定成「1 項」。先前 `NEXT-BATCH` 的其餘 45 種預設描述仍須另找實際呼叫路徑，不能列為不適用或已完成。

## 下一步與驗收界線

1. 對上表 9 句提供「精確英文、建議正體中文、適用來源 ID 與限制」的私下預覽，由 Marc 核准文字及 Perk 擴用範圍；未核准前，網站維持英文，公開 repo 不保存建議譯文。
2. 核准後依雙來源 Sheet 流程匯入 APPROVED UI，僅在官方 ID、原名稱／描述與類型吻合時於顯示層套用。改名、自訂、未知或來源改寫保留原文。
3. 以實際建角路徑查每類至少一個代表，逐格記錄候選、已選、右側摘要、英雄總覽、詳情及經典角色卡；不顯示預設句的位置附理由。補正體中文／英文及回退測試、瀏覽器證據，再跑完整隔離驗證，交同一 PR 人工驗收。

此盤點不涵蓋 `FeatureConfigPanel` 的物品、升級、休息與其他 Modal 呼叫；若同一句共用接點，實作時需一併檢查那些官方用途，不能從建角通過推論全部完成。
