# 待辦與下一個動作

以此表追蹤未完成工作；歷史文件中的「另案」不再作為目前待辦。維護 1–5 的實作與驗證見 PROGRESS。

| ID | 狀態／負責範圍 | 下一個動作 | 完成條件 |
|---|---|---|---|
| KITS-ABILITIES-01 | 等待 Marc 人工驗收；[draft PR #79](https://github.com/boyiad2110/forgesteel-zh-tw/pull/79) | 按 [驗收清單](KITS-ABILITIES-01.md) 檢查 21 個招牌招式、13 個效果，以及 Mountain／Sniper 的動態數值 | 招式名稱、描述、效果在能力面板與 Classic View 正確；自動計算隨屬性值更新；驗收前不合併、不部署 |
| DISPLAY-DEFAULTS | 待後續批次 / 54 種未核准特性預設描述 | Career 的 Crafting Perk 標題、Skills 標題及 Perk 類別標籤已接入既有 APPROVED UI／Glossary；一般特性預設說明仍需依呼叫情境盤點：9 類空描述先核對實際頁面，45 類逐一追蹤接點。Perk 預設說明仍待來源核准 | 不以生成語言／技能提示代替 FeatureType 預設描述完成率；每批先預覽 |
| BOOK-01 | Inciting Incidents／Career Summary／Career UI 已驗收；PR #66 與 PR #68 均已合併 | #66 已接入 108 個事件名稱／描述及 18 個 Career 名稱／簡介，Marc 於 2026-10-13 驗收並合併 develop。Career UI [PR #68](https://github.com/boyiad2110/forgesteel-zh-tw/pull/68) 已於 2026-10-13 squash 合併 develop `5e7f7220`：15 個英文吻合的專長名稱已接入；`I've Read About This Place`、`Put Your Back Into It`、`Spot The Tell` 維持網站英文。74 筆 Career 背景問題已隨 2026-10-14 書本快照進入核准目錄，網站仍無對應欄位 | 74 筆問題維持書本範圍，不新增欄位、不改模型或存檔 |
| BOOK-02 | 外部書本翻譯依賴／Marc | 書本工作流決定 Glossary Enhancement | 書本 Master Sheet 決策更新；不阻塞現有名稱顯示 |
| RELEASE-01 | 正式開放前／runtime | 為目錄載入失敗設計受控重試與診斷，補失敗→恢復測試 | 可恢復且沒有 render 重試迴圈 |
| RELEASE-02 | 正式開放前／網站識別 | 核對 HTML/PWA 語言、名稱、分享網址 | 與正式站識別一致 |
| RELEASE-03 | 正式開放前／離線驗證 | 實測字型切片與離線快取上限；按實際字集調整 | 無網路時已快取頁面與中文可讀，不以線上正常推論 |
| UX-01 | 正式開放後／玩家研究 | 測試中文名稱＋英文搜尋，再決定是否做中文別名 | 有玩家操作證據與來源設計 |

**已結案**：MASTER-SPLIT B／C／D1／D2 已於 2026-10-12 完成（[PR #64](https://github.com/boyiad2110/forgesteel-zh-tw/pull/64)，`develop` `b983dd4d`）；雙來源更新已是正式路徑，不再是 TODO。PERKS-01 已於 2026-10-15 由 Marc 驗收為 COMPLETE：Heroes 47/47 專長、6 個類別；[PR #69](https://github.com/boyiad2110/forgesteel-zh-tw/pull/69) 已驗收，合併狀態見 PR。魔寵無英雄時的體力算式已於 2026-10-16 由 Marc 驗收；[PR #70](https://github.com/boyiad2110/forgesteel-zh-tw/pull/70) 合併狀態見 PR。經典角色卡專長計數列已於 2026-10-16 由 Marc 驗收；[PR #71](https://github.com/boyiad2110/forgesteel-zh-tw/pull/71) 合併狀態見 PR。仍保留英文的是量詞 Perk、既有圖示與按鈕字，以及 villain／champion／perform 色帶。KITS-01、KITS-GLOSSARY、KITS-UI、KITS-DISPLAY 的驗收與合併見 [PROGRESS](PROGRESS.md)；Classic View 六個標題補譯進度見 [KITS-CLASSIC-UI](KITS-CLASSIC-UI.md)。

已驗收：MAINT-WORKFLOW-01（#56；合併狀態見原 PR）、DISPLAY-01（#55）、DISPLAY-02（#57；合併狀態見原 PR）、UI-01／UI-02（#58；合併狀態見原 PR）、UI-03 / DISPLAY-03 建角與角色摘要範圍（#59；已合併 develop `71be5478`，CI 全綠）、UI-04 / DISPLAY-04 族裔與文化右側設定（#60；Marc 已人工驗收，已 squash 合併 develop `4da55d95`，最新 CI 全綠；Sheet Status / Project State / CHG-0086 已回讀）。UI-05 語言 / 技能選擇（PR #61）已於 2026-10-11 由 Marc 人工驗收通過，已 squash 合併 develop `acb093eb`；未核准項目併入 BOOK-01 與 DISPLAY-DEFAULTS。已結束：來源掃描逾時（#53）、快照與 Note 整合（#37）、總數集中化（#34）。依賴稽核與上游同步的本次結果以 PROGRESS 為準；日後新增漏洞重新開列，不沿用舊數量。

