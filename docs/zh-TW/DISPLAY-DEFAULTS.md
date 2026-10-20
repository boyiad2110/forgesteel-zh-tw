# DISPLAY-DEFAULTS：官方特性預設描述

2026-10-20，基底 `develop` `4ec5c5d6`。Marc 已核准下列 9 種預設句，並核准既有 Perk 句擴用到 55 個官方職業 Perk。Forge Steel Master `Forge Steel UI` 新增 8 筆 APPROVED、沿用 1 筆；正式雙來源快照 UI 共 340 筆，Book 指紋維持 `8c6e9afd`，Forge 指紋更新為 `a7d4edb7`。候選數是來源盤點數，不是畫面漏譯數或完成率。

## 來源與觸發條件

`FeatureConfigPanel.getDescription()` 在特性的 `description` 為空時，使用 `FeatureLogic.getFeatureTypeDescription(type)` 的程式預設英文。建角頁的族裔、生涯、職業、糾葛選項會呼叫 `FeatureConfigPanel`。以下數量是對 Core、Orden、Patreon、The Beastheart、The Summoner 官方來源書的這四組內容遞迴盤點所得；同一父項內依物件去重，跨父項仍可能重複。它們是待查候選，尚非實際 DOM 證據。

| 類型 | 官方空描述候選 | 來源群／代表 ID | 核准正體中文 |
|---|---:|---|---|---|
| AncestryFeatureChoice | 2 | 族裔；`revenant-feature-4-1` | 此特性能讓你從族裔中選擇特性。 |
| Perk | 73 | 生涯 18：`career-artisan-feature-4`；職業 55：`censor-2-1` | 此特性能讓你選擇 1 項專長。 |
| Domain | 2 | 職業；`censor-1-2` | 此特性能讓你選擇領域。 |
| Kit | 6 | 職業；`censor-1-5` | 此特性能讓你選擇 1 組套裝。 |
| ClassAbility | 66 | 職業；`censor-1-8` | 此特性能讓你從職業招式中做出選擇。 |
| SummonChoice | 16 | 職業；`summoner-1-1-4` | 此特性能讓你選擇可召喚的怪物。 |
| ItemChoice | 2 | 糾葛；`comp-artifactBonded-ba` | 此特性能讓你選擇 1 件道具。 |
| Retainer | 1 | 糾葛；`comp-meddlingButler-b` | 此特性能讓你獲得 1 名隨從。 |
| Toggle | 1 | 糾葛；`comp-shatteredLegacy-b` | 此特性能讓你開啟或關閉 1 項特性。 |

四組候選合計 169 個，其中族裔 2、生涯 18、職業 145、糾葛 4。來源比對限定官方來源書的這四組：ID、名稱、類型、空描述與非選擇態資料都要吻合；已選值可變。自訂、改名、未知或來源改寫保留原文。Domain、ClassAbility、SummonChoice 有 1 選及多選來源，因此核准中文沒有擅自固定數量。其餘 45 種預設描述仍須另找實際呼叫路徑。

## 六個位置與驗收界線

`src/l10n/default-description-contracts.json` 對 10 個代表來源（Perk 分生涯與職業）逐項記錄六個位置：這些程式產生的句子在建角右側 `FeatureConfigPanel` 顯示，由純函式 Vitest 與元件 DOM 瀏覽器回歸驗證正體中文／英文／正體中文。候選卡顯示父項，英雄總覽、詳情及經典角色卡沒有呼叫這個預設描述接點，因此不把這些位置算成本批完成；它們的其他內容翻譯另依既有清冊。瀏覽器已核對 Artisan 生涯實際建角路徑與儲存資料不變；其餘九個代表的共用元件 DOM 已核對，仍待 Marc 依各建角頁人工驗收。

本批不涵蓋管理編輯器、特性類型選單的同句英文，也不代表其他 Modal 中的所有官方來源已逐頁驗收。那些頁面共用同一受保護的 `FeatureConfigPanel` 接點，之後仍應以實際用途補旅程證據。
