# 待辦與下一個動作

以此表追蹤未完成工作；歷史文件中的「另案」不再作為目前待辦。維護 1–5 的實作與驗證見 PROGRESS。

| ID | 狀態／負責範圍 | 下一個動作 | 完成條件 |
|---|---|---|---|
| DISPLAY-DEFAULTS | 待後續批次 / 54 種未核准特性預設描述 | Crafting Perk / 一般複數 Skills 標題與 Perk 預設描述併入 BOOK-01；其餘核對候選庫遇到的 9 類空描述與實際頁面接點；其餘 45 類仍需依呼叫情境盤點。Choice 已有譯文，但其他官方 ID 尚待接線 | 不以生成語言 / 技能提示代替 FeatureType 預設描述完成率；每批先預覽 |
| BOOK-01 | 外部書本翻譯依賴／Marc | 書本工作流處理 Career 翻譯與 QA；同批預覽 Skills / Crafting Perk 標題及 Perk 預設說明，並銜接 DISPLAY-DEFAULTS；Forge Steel 僅等候 APPROVED 來源 | 不由 Forge Steel Agent 補譯或核准；網站只匯入 APPROVED |
| BOOK-02 | 外部書本翻譯依賴／Marc | 書本工作流決定 Glossary Enhancement | 書本 Master Sheet 決策更新；不阻塞現有名稱顯示 |
| RELEASE-01 | 正式開放前／runtime | 為目錄載入失敗設計受控重試與診斷，補失敗→恢復測試 | 可恢復且沒有 render 重試迴圈 |
| RELEASE-02 | 正式開放前／網站識別 | 核對 HTML/PWA 語言、名稱、分享網址 | 與正式站識別一致 |
| RELEASE-03 | 正式開放前／離線驗證 | 實測字型切片與離線快取上限；按實際字集調整 | 無網路時已快取頁面與中文可讀，不以線上正常推論 |
| UX-01 | 正式開放後／玩家研究 | 測試中文名稱＋英文搜尋，再決定是否做中文別名 | 有玩家操作證據與來源設計 |

**已結案**：MASTER-SPLIT B／C／D1／D2 已於 2026-10-12 完成（[PR #64](https://github.com/boyiad2110/forgesteel-zh-tw/pull/64)，`develop` `b983dd4d`）；雙來源更新已是正式路徑，不再是 TODO。

已驗收：MAINT-WORKFLOW-01（#56；合併狀態見原 PR）、DISPLAY-01（#55）、DISPLAY-02（#57；合併狀態見原 PR）、UI-01／UI-02（#58；合併狀態見原 PR）、UI-03 / DISPLAY-03 建角與角色摘要範圍（#59；已合併 develop `71be5478`，CI 全綠）、UI-04 / DISPLAY-04 族裔與文化右側設定（#60；Marc 已人工驗收，已 squash 合併 develop `4da55d95`，最新 CI 全綠；Sheet Status / Project State / CHG-0086 已回讀）。UI-05 語言 / 技能選擇（PR #61）已於 2026-10-11 由 Marc 人工驗收通過，已 squash 合併 develop `acb093eb`；未核准項目併入 BOOK-01 與 DISPLAY-DEFAULTS。已結束：來源掃描逾時（#53）、快照與 Note 整合（#37）、總數集中化（#34）。依賴稽核與上游同步的本次結果以 PROGRESS 為準；日後新增漏洞重新開列，不沿用舊數量。
