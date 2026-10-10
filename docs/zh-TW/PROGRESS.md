# 目前進度

| 批次 | 狀態／PR／版本 | 驗證與下一步 |
|---|---|---|
| 維護 1–5 | 已完成；[PR #54](https://github.com/boyiad2110/forgesteel-zh-tw/pull/54)，develop 合併 `b79c1d0d` | 2026-10-10，程式與治理版本 `70fa69e2`；972/972 測試、六項完整驗證、audit 0 漏洞及隔離瀏覽器回歸。詳見原 PR 與 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/37993319244) |
| DISPLAY-01 | Marc 人工驗收通過並已合併；[PR #55](https://github.com/boyiad2110/forgesteel-zh-tw/pull/55)，develop 合併 `1154e6ca` | 2026-10-10，head `872ae31d`；973/973、六項完整驗證、audit 0 漏洞及文化瀏覽器操作。最新 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38017844450) 成功；Sheet Status／Project State／CHG-0078 已回讀確認。原批使用 merge，後續一般內容依 RULES 用 squash；不改寫歷史 |
| DISPLAY-02 | Marc 人工驗收通過；[PR #57](https://github.com/boyiad2110/forgesteel-zh-tw/pull/57)，合併狀態見原 PR | 程式版本 `ea300a29`；隔離完整 verify：978/978、六項檢查、audit 0 漏洞、五組瀏覽器回歸通過；Marc 於 2026-10-10 驗收通過。接線限建角 ancestry／culture Choice 標題與描述；Bespoke Culture 已選 Field 描述及龍鱗動態描述仍待後續預覽。 |
| MAINT-WORKFLOW-01 | Marc 已驗收；合併狀態見 [PR #56](https://github.com/boyiad2110/forgesteel-zh-tw/pull/56) | 2026-10-10，程式版本 `91612f32`；隔離副本乾淨安裝、978/978 測試、六項完整驗證、audit 0 漏洞及五組瀏覽器回歸通過；修正過期狀態、結案順序、Sheet 寫入、環境診斷與隔離驗證。文件更新引用同程式版本結果；最新 CI、實際合併 SHA 與 Sheet 結案回讀集中原 PR |
| UI-01／UI-02 | Marc 已定稿 151 筆 APPROVED 並完成人工驗收；[PR #58](https://github.com/boyiad2110/forgesteel-zh-tw/pull/58)（合併狀態見 PR） | 2026-10-10：依 Marc 指示修訂 5 筆 UI 譯文；隔離副本乾淨安裝，981/981 測試、六項完整驗證、audit 0 漏洞與五組瀏覽器回歸通過；驗證來源工作樹 SHA-256 `691649d599d1abb053335fb7aed7389a3b58c823f82b507d5c58711b67f9da38`。核准清冊維持 579 個 mapping。 |

DISPLAY-02 當時的核准清冊為 428／105／11；UI-01／UI-02 接入後為 579／105／11。兩個 DISPLAY 批次的來源、範圍與限制集中各自原 PR；本輪 UI 定稿與實作不代表其他 P3/P4 譯文已核准，也不代表網站正式發布。

目前待辦與下一動作只看 [TODO](TODO.md)。UI-01 的 151 筆已由 Marc 定稿為 APPROVED，依 332 筆 Glossary、10 筆 TM 核對；UI-02 快照／匯出／守門已實作並通過完整驗證，兩項均已通過 Marc 人工驗收。Career 411 NEW、Enhancement 待定。

詳細治理與驗證入口見 [RULES](RULES.md)、[UPSTREAM](UPSTREAM.md)、[BATCH-TEMPLATE](BATCH-TEMPLATE.md)。完整舊進度保留 [歷史](history/PROGRESS-2026-10-10.md)，已結案項目不從歷史重新列待辦。
