# 待辦與下一個動作

以此表追蹤未完成工作；歷史文件中的「另案」不再作為目前待辦。維護 1–5 的實作與驗證見 PROGRESS。

| ID | 狀態／負責範圍 | 下一個動作 | 完成條件 |
|---|---|---|---|
| DISPLAY-DEFAULTS 後續 | 45 種預設描述仍待盤點；本批 9 種已核准接入、待人工驗收 | 逐類找實際呼叫路徑、來源與畫面，再預覽需要新增的譯文；管理編輯器與特性類型選單另查 | 不以本批 169 個來源候選或 10 個代表畫面當成全站完成率 |
| BOOK-02 | 外部書本翻譯依賴／Marc | 書本工作流決定 Glossary Enhancement | 書本 Master Sheet 決策更新；不阻塞現有名稱顯示 |
| RELEASE-01 | 正式開放前／runtime | 為目錄載入失敗設計受控重試與診斷，補失敗→恢復測試 | 可恢復且沒有 render 重試迴圈 |
| RELEASE-02 | 正式開放前／網站識別 | 核對 HTML/PWA 語言、名稱、分享網址 | 與正式站識別一致 |
| RELEASE-03 | 正式開放前／離線驗證 | 實測字型切片與離線快取上限；按實際字集調整 | 無網路時已快取頁面與中文可讀，不以線上正常推論 |
| UX-01 | 正式開放後／玩家研究 | 測試中文名稱＋英文搜尋，再決定是否做中文別名 | 有玩家操作證據與來源設計 |

**已結案**：MASTER-SPLIT B／C／D1／D2 已於 2026-10-12 完成（[PR #64](https://github.com/boyiad2110/forgesteel-zh-tw/pull/64)，`develop` `b983dd4d`）；雙來源更新已是正式路徑，不再是 TODO。PERKS-01 已於 2026-10-15 由 Marc 驗收為 COMPLETE：Heroes 47/47 專長、6 個類別；[PR #69](https://github.com/boyiad2110/forgesteel-zh-tw/pull/69) 已驗收，合併狀態見 PR。魔寵無英雄時的體力算式已於 2026-10-16 由 Marc 驗收；[PR #70](https://github.com/boyiad2110/forgesteel-zh-tw/pull/70) 合併狀態見 PR。經典角色卡專長計數列已於 2026-10-16 由 Marc 驗收；[PR #71](https://github.com/boyiad2110/forgesteel-zh-tw/pull/71) 合併狀態見 PR。仍保留英文的是量詞 Perk、既有圖示與按鈕字，以及 villain／champion／perform 色帶。KITS-01、KITS-GLOSSARY、KITS-UI、KITS-DISPLAY 的驗收與合併見 [PROGRESS](PROGRESS.md)；Classic View 六個標題補譯進度見 [KITS-CLASSIC-UI](KITS-CLASSIC-UI.md)。

已驗收：MAINT-WORKFLOW-01（#56；合併狀態見原 PR）、DISPLAY-01（#55）、DISPLAY-02（#57；合併狀態見原 PR）、UI-01／UI-02（#58；合併狀態見原 PR）、UI-03 / DISPLAY-03 建角與角色摘要範圍（#59；已合併 develop `71be5478`，CI 全綠）、UI-04 / DISPLAY-04 族裔與文化右側設定（#60；Marc 已人工驗收，已 squash 合併 develop `4da55d95`，最新 CI 全綠；Sheet Status / Project State / CHG-0086 已回讀）。UI-05 語言 / 技能選擇（PR #61）已於 2026-10-11 由 Marc 人工驗收通過，已 squash 合併 develop `acb093eb`；未核准項目併入 BOOK-01 與 DISPLAY-DEFAULTS。已結束：來源掃描逾時（#53）、快照與 Note 整合（#37）、總數集中化（#34）。依賴稽核與上游同步的本次結果以 PROGRESS 為準；日後新增漏洞重新開列，不沿用舊數量。

