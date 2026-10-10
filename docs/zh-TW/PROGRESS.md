# 目前進度

| 批次 | 狀態／PR／版本 | 驗證與下一步 |
|---|---|---|
| 維護 1–5 | 已完成；[PR #54](https://github.com/boyiad2110/forgesteel-zh-tw/pull/54)，develop 合併 `b79c1d0d` | 2026-10-10，程式與治理版本 `70fa69e2`；972/972 測試、六項完整驗證、audit 0 漏洞及隔離瀏覽器回歸。詳見原 PR 與 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/37993319244) |
| DISPLAY-01 | Marc 人工驗收通過並已合併；[PR #55](https://github.com/boyiad2110/forgesteel-zh-tw/pull/55)，develop 合併 `1154e6ca` | 2026-10-10，head `872ae31d`；973/973、六項完整驗證、audit 0 漏洞及文化瀏覽器操作。最新 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38017844450) 成功；Sheet Status／Project State／CHG-0078 已回讀確認。原批使用 merge，後續一般內容依 RULES 用 squash；不改寫歷史 |
| DISPLAY-02 | Marc 人工驗收通過；[PR #57](https://github.com/boyiad2110/forgesteel-zh-tw/pull/57)，合併狀態見原 PR | 程式版本 `ea300a29`；隔離完整 verify：978/978、六項檢查、audit 0 漏洞、五組瀏覽器回歸通過；Marc 於 2026-10-10 驗收通過。接線限建角 ancestry／culture Choice 標題與描述；當時延後的 Bespoke Culture Field 描述已由 PR #59 接入，本次補齊 13 個面向核對；龍鱗動態描述已在 UI-04 / DISPLAY-04 核准並接入。 |
| MAINT-WORKFLOW-01 | Marc 已驗收；合併狀態見 [PR #56](https://github.com/boyiad2110/forgesteel-zh-tw/pull/56) | 2026-10-10，程式版本 `91612f32`；隔離副本乾淨安裝、978/978 測試、六項完整驗證、audit 0 漏洞及五組瀏覽器回歸通過；修正過期狀態、結案順序、Sheet 寫入、環境診斷與隔離驗證。文件更新引用同程式版本結果；最新 CI、實際合併 SHA 與 Sheet 結案回讀集中原 PR |
| UI-01／UI-02 | Marc 已定稿 151 筆 APPROVED 並完成人工驗收；[PR #58](https://github.com/boyiad2110/forgesteel-zh-tw/pull/58)（合併狀態見 PR） | 2026-10-10：依 Marc 指示修訂 5 筆 UI 譯文；隔離副本乾淨安裝，981/981 測試、六項完整驗證、audit 0 漏洞與五組瀏覽器回歸通過；驗證來源工作樹 SHA-256 `691649d599d1abb053335fb7aed7389a3b58c823f82b507d5c58711b67f9da38`。核准清冊維持 579 個 mapping。 |
| UI-03 / DISPLAY-03（建角與角色摘要） | Marc 人工驗收通過；[PR #59](https://github.com/boyiad2110/forgesteel-zh-tw/pull/59) 已 squash 合併 develop `71be5478` | 2026-10-10：接入 15 筆 APPROVED 共用 UI 對照；文化頁、建角頁、角色摘要均由 Marc 驗收通過。最新 head `a9853d53` 的 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38056294762) 全綠：981/981、六項檢查、audit 0、五組瀏覽器回歸。Sheet Status 第 31 列／Project State／CHG-0085 已結案，本次讀回確認。 |
| UI-04 / DISPLAY-04（族裔與文化右側設定） | Marc 人工驗收通過；[PR #60](https://github.com/boyiad2110/forgesteel-zh-tw/pull/60) 已 squash 合併 develop `4da55d95` | 2026-10-10，程式版本 `e8920d7b`、基底 `71be5478`：982/982 測試、六項隔離檢查、audit 0 漏洞及 6 段瀏覽器回歸通過，隔離來源指紋前後一致。最新 head `9ebb6e2e` 的 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38064075869) 全綠；本次回讀 Sheet Status 第 32 列 / Project State / CHG-0086 確認結案。8 筆核准 UI 與 Wyrmplate 模板維持原驗收範圍；清冊 602 / 106 / 11。 |
| UI-05 / DISPLAY-05（建角詳情與語言 / 技能選擇） | [PR #61](https://github.com/boyiad2110/forgesteel-zh-tw/pull/61) 開啟；最新 CI 全綠，等待 Marc 人工驗收，尚未合併 | 2026-10-11，head `a2bc0af8`、分支 `codex/ui-05-details-inventory`：原始版本完整隔離驗證為 987/987 測試、lint、build、audit 0 漏洞及 7 組瀏覽器回歸。人工驗收後修正官方生成提示比對、技能用途描述重用核准規則表，並補上無來源參照的標準「任意技能類別」選項；本機瀏覽器回歸確認顯示「從任意技能類別中選擇 1 項技能。」。最新 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38073402572) 全綠：語系守門、lint、型別、測試、build、audit 與玩家旅程瀏覽器回歸。等待 Marc 依最新 head 驗收。核准譯文、範圍及其餘待辦見 [NEXT-BATCH](NEXT-BATCH.md)。 |

DISPLAY-02 當時的核准清冊為 428／105／11；UI-01／UI-02 接入後為 579／105／11。兩個 DISPLAY 批次的來源、範圍與限制集中各自原 PR；本輪 UI 定稿與實作不代表其他 P3/P4 譯文已核准，也不代表網站正式發布。

目前待辦與下一動作只看 [TODO](TODO.md)。截至 UI-05 核准寫入後，清冊為 618 / 106 / 11。UI-01 至 UI-04 的驗收與合併見上表；UI-05 PR #61 最新 CI 全綠，等待 Marc 人工驗收。Career 411 NEW、Enhancement 待定。

詳細治理與驗證入口見 [RULES](RULES.md)、[UPSTREAM](UPSTREAM.md)、[BATCH-TEMPLATE](BATCH-TEMPLATE.md)。完整舊進度保留 [歷史](history/PROGRESS-2026-10-10.md)，已結案項目不從歷史重新列待辦。
