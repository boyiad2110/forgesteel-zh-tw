# 先讀這裡

- KITS-01 已由 Marc 驗收並於 2026-10-17 squash 合併至 `develop` `19c03197fbe37660eeaedae7bb480e4fe84b3f26`；Rapid Fire 顯示「箭雨」。KITS-GLOSSARY 的 12 筆護甲／武器詞也已驗收並 squash 合併至 develop `90094a293e5d682e848bb46fdb777a63b34d3878`。KITS-01 與 Glossary 的驗證結果見 [PROGRESS](PROGRESS.md)。
- KITS-01、KITS-GLOSSARY、KITS-UI、KITS-DISPLAY、KITS-CLASSIC-UI 與 KITS-ABILITIES-01 均已由 Marc 驗收並合併；KITS-ABILITIES-01 的 [PR #79](https://github.com/boyiad2110/forgesteel-zh-tw/pull/79) 已 squash 合併至 `develop` `4baefd664651cf80079eaa78e3b29d96d54f6ec4`。套裝招式殘留 UI 標籤補齊進度見 [KITS-AUDIT-UI-01](KITS-AUDIT-UI-01.md) 與 [PROGRESS](PROGRESS.md)。
- KITS-AUDIT-UI-01 正在補齊套裝招式殘留 UI 標籤、射程與 Classic View 效果描述；四筆已核准 UI 已接入雙來源快照。人工驗收清單與進度見 [KITS-AUDIT-UI-01](KITS-AUDIT-UI-01.md) 與 [PROGRESS](PROGRESS.md)。
- 族裔缺漏 A–E5 已由 Marc 驗收或指示納入本次 PR 收尾；目前由 PR #81 整合，等待遠端必要檢查與合併。A 批見 [Draft PR #81](https://github.com/boyiad2110/forgesteel-zh-tw/pull/81)，B 批見 [驗收紀錄](ANCESTRY-DAMAGE-MODIFIERS.md)，C 批見 [驗收紀錄](ANCESTRY-C.md)，D 批見 [ANCESTRY-D](ANCESTRY-D.md)，E1 見 [ANCESTRY-E1](ANCESTRY-E1.md)，E2 見 [ANCESTRY-E2](ANCESTRY-E2.md)，E3 見 [ANCESTRY-E3](ANCESTRY-E3.md)，E4 見 [ANCESTRY-E4](ANCESTRY-E4.md)。
- E5 修正重複截圖指出的共用顯示漏接，僅重用已核准譯文；Marc 於 2026-10-20 驗收通過，已納入 PR #81。範圍與驗收位置見 [ANCESTRY-E5](ANCESTRY-E5.md) 與 [PROGRESS](PROGRESS.md)。

本專案保留現有顯示層中文化架構。先讀此摘要即可接手；詳細內容依任務載入。

## 現況與下一步

- **MASTER-SPLIT B／C／D1／D2 全部 COMPLETE（2026-10-12）**：[PR #64](https://github.com/boyiad2110/forgesteel-zh-tw/pull/64) 已 squash merge 至 `develop` `b983dd4df4bc2dbafd1f6ca5be21af978a0a43c4`，合併後 [CI #196](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38218830788) 通過。現行正式快照同步整合 [書本 Master](https://docs.google.com/spreadsheets/d/1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4/edit) 的核准書本翻譯及 [Forge Steel Master](https://docs.google.com/spreadsheets/d/1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw/edit) 的核准 UI／Adaptations；舊單來源流程僅供回復，未部署或刪除舊資料。

- 維護順序 1–5、DISPLAY-01、DISPLAY-02、MAINT-WORKFLOW-01 與 UI-01／UI-02 已驗收；合併狀態、PR 與驗證版本見 [PROGRESS](PROGRESS.md)。
- 核准目錄筆數與雙來源版本以 Repo 的 `src/l10n/generated/zh-TW/meta.json`、`src/l10n/source-dependencies.json` 為準；書本翻譯進度以 Draw Steel Master Sheet 的 Project State／Status 為準，不在摘要固定複製易過期的總數。這些數字是資料清冊，不代表產品中文化完成率。
- DISPLAY-01 已接上自訂文化已選面向名稱，官方三面向摘要使用中文標點；PR #59 已接上自訂文化 Field 描述，13 個面向已逐一核對來源與元件 DOM，詳見 [下一批盤點](NEXT-BATCH.md)。
- DISPLAY-02 已接上建角 ancestry／culture 選項的核准標題與描述。UI-01 的 151 筆建角器及共用玩家介面譯文已由 Marc 定稿為 APPROVED；UI-02 已接入同次快照、匯出、守門與顯示層；兩項均通過 Marc 人工驗收，合併狀態見 [PR #58](https://github.com/boyiad2110/forgesteel-zh-tw/pull/58)。龍鱗動態描述已在 UI-04 / DISPLAY-04 核准並接入。
- UI-03 / DISPLAY-03 的建角與角色摘要範圍已由 Marc 人工驗收；15 筆 APPROVED UI 對照已接入，[PR #59](https://github.com/boyiad2110/forgesteel-zh-tw/pull/59) 已合併至 develop `71be5478`，CI 全綠。UI-04 / DISPLAY-04 的 8 筆核准 UI 與龍鱗動態模板已接入並經 Marc 人工驗收，[PR #60](https://github.com/boyiad2110/forgesteel-zh-tw/pull/60) 已 squash 合併至 develop `4da55d95`，最新 CI 全綠；Master Sheet Status、Project State 與 CHG-0086 已回讀確認。原批核對紀錄保留在 [NEXT-BATCH](NEXT-BATCH.md)。
- UI-05 / DISPLAY-05 的 16 筆新 UI 已獲核准並寫入 Master Sheet、快照及 mapping；PR #61 補齊官方語言 / 技能的直接與詳情重建提示、技能用途及 Name 欄位，並移除未知來源通用技能例外。新增 228 個候選 ID 兩路 DOM 核對、20 個保護案例、改寫來源實際詳情頁與 Artisan 生涯 / 儲存回歸；本機完整隔離驗證與最新 CI 見 [PROGRESS](PROGRESS.md)。Marc 已於 2026-10-11 人工驗收通過；合併狀態見 PR。本次只重用核准譯文；Crafting Perk、其預設說明及一般複數 Skills 標題依 Marc 指示留到 Career 批次再預覽與核准；35 種工廠生成描述不計入剩餘 54 種特性預設描述。完整範圍見 [NEXT-BATCH](NEXT-BATCH.md)。
- Career 的 18 個名稱與 18 個背景簡介已補齊網站 mapping，並接入 Career 卡片、角色摘要及列印頁；Marc 已於 2026-10-13 人工驗收通過。Career Inciting Incidents 的 108 組名稱／描述也已依雙 Master 權責接入；[PR #66](https://github.com/boyiad2110/forgesteel-zh-tw/pull/66) 已 squash 合併至 develop，最新 head CI 通過。Marc 決定 5 筆版本差異描述直接沿用最新版規則書的 Book Master APPROVED 中文，Forge Steel Master 已註明這不是逐字翻譯網站英文，網站原文與書本正典均保留不變。Career UI 補接 [PR #68](https://github.com/boyiad2110/forgesteel-zh-tw/pull/68) 已於 2026-10-13 squash 合併 develop `5e7f7220`：接入核准的專長標籤、Career 益處欄位及 15 個英文吻合的專長名稱；另 3 個英文不同的名稱當時維持網站英文，其後由 PERKS-01 接入。PERKS-01 已於 2026-10-15 由 Marc 驗收為 COMPLETE：Heroes 47/47 專長、6 個類別，同一 [PR #69](https://github.com/boyiad2110/forgesteel-zh-tw/pull/69)，合併狀態見 PR。第 1 段是名稱與類別。第 2 段是 37 個純文字效果與團隊合作適配（中文只少「任何」），並補上已選列效果、憶物通靈的清單顯示、肌肉發達／幸運兒的等級投射，以及語言學家兩列適配。第 3 段是招式欄位與整段算式；Distance / Target 是「射程 / 目標」；投擲盟友有英雄時是「推動最多 4 格」與「會減少 4 格」。第 4 段是短描述、七個效果、魔寵散文、心靈感應與標籤；能力卡色帶是兩字：主要、機動、移動、免費、反應，類型列維持全名。刻意保留英文：量詞 Perk、既有圖示與按鈕字（Perks、info-circle、close、right、left、thunderbolt、potency、etc、Auto-calculate damage）、villain／champion／perform 色帶。2026-10-14 書本快照多出的 24 筆 Book Strings（套裝列）沒有 mapping，不在本批範圍。見 [PERKS-01](PERKS-01.md)。魔寵沒有英雄時的體力欄已改接核准算式，Marc 已於 2026-10-16 驗收；合併狀態見 [PR #70](https://github.com/boyiad2110/forgesteel-zh-tw/pull/70)。經典角色卡專長計數列已改接核准模板 perk-count、perk-count-list、list-or，Perk 仍是英文；Marc 已於 2026-10-16 驗收，合併狀態見 [PR #71](https://github.com/boyiad2110/forgesteel-zh-tw/pull/71)。74 筆 Career 背景問題已在書本核准目錄，網站沒有對應欄位。未核准的 Perk 預設說明另批處理。剩餘工作與下一動作集中 [TODO](TODO.md)。

## 不可違反的界線

1. 書本正典只取 Draw Steel Master Sheet（`1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`）的 APPROVED；網站 UI／Adaptations 只取 Forge Steel Sheet（`1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw`）的 APPROVED。不得自行補譯、改寫或把草稿放公開 repo。一般快照更新使用雙來源流程；未核准或沒有核准適配的網站內容保留英文；舊單來源流程僅供依核准回復程序還原 D1 快照。
2. 只在顯示時套用中文；不改遊戲資料、計算、存檔或分享碼。自訂／改名／未知內容保留原值。
3. 動態數值投射上游計算結果；未知改寫保留完整計算後英文。英文備援不算該段中文化完成。
4. `main` 是上游鏡像；工作分支經 PR 合進 `develop`。上游 push URL 維持禁用；分叉不自動部署。
5. 本機完整驗證優先用 `node scripts/l10n/verify-isolated.mjs`，在目前檔案的暫存副本乾淨安裝、跑六項及瀏覽器回歸；底層入口仍是 `verify.mjs`。任一檢查失敗整體即失敗；不截圖、不錄影。
6. 一般內容批次仍先對照預覽與 Marc 核准。UI-01 的 151 筆已由 Marc 定稿並標為 APPROVED，可接入公開程式碼；後續新增譯文仍須先核准。

## 任務路由

| 任務 | 讀取 |
|---|---|
| 改程式／治理 | [RULES](RULES.md)，只再讀相關決策 |
| 快照與 Note | [SNAPSHOT](SNAPSHOT.md)；先讀線上 Project State、Status，單一寫入者 |
| 上游同步／分支規則 | [UPSTREAM](UPSTREAM.md) |
| 顯示覆蓋／P3 | [COVERAGE](COVERAGE.md) |
| P4／多來源過期 | [P4-STRUCTURE](P4-STRUCTURE.md) |
| 結案 | [BATCH-TEMPLATE](BATCH-TEMPLATE.md)，補原 PR 一次 |
| 例外與決策理由 | [DECISIONS](DECISIONS.md)；只有需要時讀其中的歷史索引 |

本機：`C:\TRPG\Draw Steel site\forgesteel-zh-tw`。經典表格入口：`#/hero/view/<ID>` 改為 `#/hero/sheet/<ID>`。

